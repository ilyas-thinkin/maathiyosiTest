// app/api/phonepe/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const transactionId = searchParams.get("transactionId");
    const orderId = searchParams.get("orderId");

    if (!transactionId && !orderId) {
      return NextResponse.json(
        { error: "Transaction ID or Order ID required" },
        { status: 400 }
      );
    }

    // Get auth token
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/phonepe/auth`, {
      method: "POST",
    });

    if (!authResponse.ok) {
      throw new Error("Failed to get PhonePe auth token");
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Check status from PhonePe
    const statusUrl = `${process.env.PHONEPE_STATUS_URL}/${orderId || transactionId}`;
    
    const statusResponse = await fetch(statusUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const statusData = await statusResponse.json();

    if (!statusResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch payment status", details: statusData },
        { status: statusResponse.status }
      );
    }

    // Update database with latest status
    if (transactionId) {
      const paymentStatus = statusData.code === "PAYMENT_SUCCESS" ? "success" : 
                           statusData.code === "PAYMENT_PENDING" ? "pending" : "failed";

      await supabase
        .from("purchase")
        .update({
          status: paymentStatus,
          payment_response: statusData,
        })
        .eq("transaction_id", transactionId);
    }

    return NextResponse.json({
      success: true,
      status: statusData.code,
      data: statusData,
    });
  } catch (error: any) {
    console.error("PhonePe Status Check Error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}