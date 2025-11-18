// app/api/phonepe/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transactionId, status, code, message } = body;

    console.log("PhonePe Callback received:", body);

    // Verify the callback signature (optional but recommended)
    const receivedChecksum = req.headers.get("X-VERIFY");
    const calculatedChecksum = generateChecksum(body);

    if (receivedChecksum && receivedChecksum !== calculatedChecksum) {
      console.error("Checksum verification failed");
      return NextResponse.json(
        { error: "Invalid checksum" },
        { status: 400 }
      );
    }

    // Find the purchase record
    const { data: purchase, error: findError } = await supabase
      .from("purchase")
      .select("*")
      .eq("transaction_id", transactionId)
      .single();

    if (findError || !purchase) {
      console.error("Purchase not found:", findError);
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    // Update purchase status based on payment status
    let updateStatus = "failed";
    if (status === "SUCCESS" || code === "PAYMENT_SUCCESS") {
      updateStatus = "success";
    } else if (status === "PENDING") {
      updateStatus = "pending";
    }

    const { error: updateError } = await supabase
      .from("purchase")
      .update({
        status: updateStatus,
        payment_response: body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", purchase.id);

    if (updateError) {
      console.error("Failed to update purchase:", updateError);
      return NextResponse.json(
        { error: "Failed to update purchase" },
        { status: 500 }
      );
    }

    // Redirect user based on status
    if (updateStatus === "success") {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?transaction_id=${transactionId}`
      );
    } else {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failed?transaction_id=${transactionId}&message=${encodeURIComponent(message || "Payment failed")}`
      );
    }
  } catch (error: any) {
    console.error("PhonePe Callback Error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

// Also handle GET requests (some payment gateways use GET for redirects)
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const transactionId = searchParams.get("transactionId");
  const status = searchParams.get("status");

  if (!transactionId) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failed?message=Invalid+transaction`
    );
  }

  // Update database based on status
  let updateStatus = "failed";
  if (status === "SUCCESS") {
    updateStatus = "success";
  }

  await supabase
    .from("purchase")
    .update({ status: updateStatus })
    .eq("transaction_id", transactionId);

  if (updateStatus === "success") {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?transaction_id=${transactionId}`
    );
  } else {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failed?transaction_id=${transactionId}`
    );
  }
}

function generateChecksum(payload: any): string {
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET!;
  const dataString = JSON.stringify(payload);
  const hash = crypto
    .createHmac("sha256", clientSecret)
    .update(dataString)
    .digest("hex");
  return hash;
}