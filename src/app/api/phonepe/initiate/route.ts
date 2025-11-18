// app/api/phonepe/initiate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { courseId, amount, userId, userEmail, userName } = await req.json();

    if (!courseId || !amount || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate unique transaction ID
    const transactionId = `TXN_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const orderId = `ORDER_${Date.now()}`;

    // Get auth token
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/phonepe/auth`, {
      method: "POST",
    });

    if (!authResponse.ok) {
      throw new Error("Failed to get PhonePe auth token");
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Create purchase record in database
    const { data: purchaseData, error: dbError } = await supabase
      .from("purchase")
      .insert({
        user_id: userId,
        course_id: courseId,
        amount: amount,
        status: "pending",
        transaction_id: transactionId,
        order_id: orderId,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to create purchase record" },
        { status: 500 }
      );
    }

    // Create payment request for PhonePe
    const paymentPayload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      transactionId: transactionId,
      amount: amount * 100, // Convert to paise
      merchantOrderId: orderId,
      message: `Payment for course`,
      mobileNumber: "9999999999", // Can be replaced with user's mobile if available
      email: userEmail || "",
      shortName: userName || "User",
      subMerchant: process.env.PHONEPE_MERCHANT_ID,
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/phonepe/callback`,
      redirectMode: "POST",
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/phonepe/callback`,
    };

    const paymentResponse = await fetch(process.env.PHONEPE_PAY_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-VERIFY": generateChecksum(paymentPayload),
      },
      body: JSON.stringify(paymentPayload),
    });

    const paymentData = await paymentResponse.json();

    if (!paymentResponse.ok || !paymentData.success) {
      // Update purchase status to failed
      await supabase
        .from("purchase")
        .update({ status: "failed" })
        .eq("id", purchaseData.id);

      return NextResponse.json(
        { error: "Failed to initiate payment", details: paymentData },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentUrl: paymentData.data.instrumentResponse.redirectInfo.url,
      transactionId: transactionId,
      orderId: orderId,
      purchaseId: purchaseData.id,
    });
  } catch (error: any) {
    console.error("PhonePe Initiate Error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

// Generate checksum for PhonePe verification
function generateChecksum(payload: any): string {
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET!;
  const dataString = JSON.stringify(payload);
  const hash = crypto
    .createHmac("sha256", clientSecret)
    .update(dataString)
    .digest("hex");
  return hash;
}