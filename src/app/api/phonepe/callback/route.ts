// app/api/phonepe/callback/route.ts - PhonePe V2 Webhook
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * PhonePe V2 Webhook Handler
 * Receives POST webhooks from PhonePe with event notifications
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("PhonePe V2 Webhook received:", JSON.stringify(body, null, 2));

    // V2 webhook structure
    const event = body.event;
    const payload = body.payload;

    if (!event || !payload) {
      console.error("Invalid webhook structure - missing event or payload");
      return NextResponse.json(
        { error: "Invalid webhook data" },
        { status: 400 }
      );
    }

    // Extract merchant order ID
    const merchantOrderId = payload.merchantOrderId || payload.orderId;

    if (!merchantOrderId) {
      console.error("No merchant order ID found in webhook");
      return NextResponse.json(
        { error: "Missing merchant order ID" },
        { status: 400 }
      );
    }

    console.log("Processing webhook for order:", merchantOrderId, "Event:", event);

    // Find the purchase record
    const { data: purchase, error: findError } = await supabase
      .from("purchase")
      .select("*")
      .eq("transaction_id", merchantOrderId)
      .single();

    if (findError || !purchase) {
      console.error("Purchase not found for order:", merchantOrderId, findError);
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    // Determine payment status based on event and payload.state
    let updateStatus = "failed";
    const payloadState = payload.state || payload.status;
    const payloadCode = payload.code;

    // V2 events: checkout.order.completed, checkout.order.failed
    // Also check for various status/code combinations
    if (
      event === "checkout.order.completed" ||
      payloadState === "COMPLETED" ||
      payloadState === "SUCCESS" ||
      payloadCode === "PAYMENT_SUCCESS" ||
      payloadCode === "SUCCESS"
    ) {
      updateStatus = "success";
    } else if (
      event === "checkout.order.failed" ||
      payloadState === "FAILED" ||
      payloadCode === "PAYMENT_FAILED" ||
      payloadCode === "FAILED"
    ) {
      updateStatus = "failed";
    } else if (
      payloadState === "PENDING" ||
      payloadCode === "PAYMENT_PENDING"
    ) {
      updateStatus = "pending";
    }

    console.log("POST Webhook - Updating purchase status:", {
      purchaseId: purchase.id,
      status: updateStatus,
      event: event,
      payloadState: payloadState,
      payloadCode: payloadCode
    });

    // Update purchase status
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

    // Return success response to PhonePe
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("PhonePe V2 Webhook Error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle GET redirect from PhonePe payment page
 * V2 may redirect users back to this URL after payment
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  // Log all query parameters to debug
  console.log("PhonePe V2 GET redirect - All params:", Object.fromEntries(searchParams.entries()));
  console.log("Full URL:", req.url);

  // Try multiple possible parameter names
  const merchantOrderId = searchParams.get("merchantOrderId") ||
                          searchParams.get("orderId") ||
                          searchParams.get("transactionId") ||
                          searchParams.get("merchantTransactionId") ||
                          searchParams.get("order_id") ||
                          searchParams.get("transaction_id");

  console.log("Extracted merchantOrderId:", merchantOrderId);

  if (!merchantOrderId) {
    console.error("No merchant order ID found in callback. Available params:", Array.from(searchParams.keys()));
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/payment-failure?message=Invalid+transaction`
    );
  }

  // Verify payment status by calling PhonePe V2 status API
  try {
    console.log("Checking payment status for order:", merchantOrderId);
    const statusResponse = await checkPaymentStatusV2(merchantOrderId);
    console.log("PhonePe status response:", JSON.stringify(statusResponse, null, 2));

    let updateStatus = "failed";

    // PhonePe V2 uses different response structures, check all possible fields
    const state = statusResponse.state ||
                  statusResponse.payload?.state ||
                  statusResponse.data?.state ||
                  statusResponse.status;

    const code = statusResponse.code ||
                 statusResponse.payload?.code ||
                 statusResponse.data?.code;

    console.log("Extracted state:", state, "code:", code);

    // Check for success status - PhonePe V2 may use different values
    if (state === "COMPLETED" ||
        code === "PAYMENT_SUCCESS" ||
        code === "SUCCESS" ||
        state === "SUCCESS") {
      updateStatus = "success";
    } else if (state === "PENDING" || code === "PAYMENT_PENDING") {
      updateStatus = "pending";
    } else if (state === "FAILED" || code === "PAYMENT_FAILED" || code === "FAILED") {
      updateStatus = "failed";
    }

    console.log("Updating purchase status to:", updateStatus);

    const { error: updateError } = await supabase
      .from("purchase")
      .update({
        status: updateStatus,
        payment_response: statusResponse,
        updated_at: new Date().toISOString()
      })
      .eq("transaction_id", merchantOrderId);

    if (updateError) {
      console.error("Failed to update purchase status:", updateError);
    } else {
      console.log("Successfully updated purchase status to:", updateStatus);
    }

    if (updateStatus === "success") {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?transaction_id=${merchantOrderId}`
      );
    } else if (updateStatus === "pending") {
      // For pending status, also redirect to a waiting page or success page
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?transaction_id=${merchantOrderId}&status=pending`
      );
    } else {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/payment-failure?transaction_id=${merchantOrderId}`
      );
    }
  } catch (error: any) {
    console.error("Error checking V2 payment status:", error);
    console.error("Error details:", error.message, error.stack);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/payment-failure?transaction_id=${merchantOrderId}&error=${encodeURIComponent(error.message)}`
    );
  }
}

/**
 * Check payment status using PhonePe V2 Order Status API
 * Requires OAuth token for authentication
 */
async function checkPaymentStatusV2(merchantOrderId: string): Promise<any> {
  const statusBaseUrl = process.env.PHONEPE_STATUS_URL!;

  // Get OAuth token
  const accessToken = await getPhonePeAccessToken();

  // V2 Status API endpoint: /apis/pg/checkout/v2/order/{merchantOrderId}/status
  const url = `${statusBaseUrl}/${merchantOrderId}/status`;

  console.log("Checking V2 payment status for order:", merchantOrderId, "URL:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `O-Bearer ${accessToken}`,
      "Accept": "application/json"
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("V2 Status check failed:", {
      status: response.status,
      body: errorText
    });
    throw new Error(`Failed to check payment status: ${response.status}`);
  }

  const data = await response.json();
  console.log("V2 Status response:", data);

  return data;
}

/**
 * Get OAuth access token for PhonePe V2 API
 */
async function getPhonePeAccessToken(): Promise<string> {
  const tokenUrl = process.env.PHONEPE_TOKEN_URL!;
  const clientId = process.env.PHONEPE_CLIENT_ID!;
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET!;
  const clientVersion = process.env.PHONEPE_CLIENT_VERSION || "1";

  // PhonePe v2 requires form data in body (as per customer support example)
  const formBody = new URLSearchParams({
    client_id: clientId,
    client_version: clientVersion,
    client_secret: clientSecret,
    grant_type: "client_credentials"
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formBody.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get OAuth token: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  if (!data.access_token) {
    throw new Error("No access token in OAuth response");
  }

  return data.access_token;
}