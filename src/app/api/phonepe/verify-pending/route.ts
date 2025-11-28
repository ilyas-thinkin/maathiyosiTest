// app/api/phonepe/verify-pending/route.ts
// Manual verification endpoint to check pending payments
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET endpoint to verify a specific pending transaction
 * Usage: /api/phonepe/verify-pending?transactionId=ORDER_xxx
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const transactionId = searchParams.get("transactionId");

    if (!transactionId) {
      return NextResponse.json(
        { error: "transactionId parameter required" },
        { status: 400 }
      );
    }

    // Find the purchase
    const { data: purchase, error: findError } = await supabase
      .from("purchase")
      .select("*")
      .eq("transaction_id", transactionId)
      .single();

    if (findError || !purchase) {
      return NextResponse.json(
        { error: "Purchase not found", transactionId },
        { status: 404 }
      );
    }

    console.log("Current purchase status:", purchase.status);

    // Check payment status from PhonePe
    try {
      const statusResponse = await checkPaymentStatusV2(transactionId);
      console.log("PhonePe status response:", JSON.stringify(statusResponse, null, 2));

      let updateStatus = "failed";

      // PhonePe V2 uses different response structures
      const state = statusResponse.state ||
                    statusResponse.payload?.state ||
                    statusResponse.data?.state ||
                    statusResponse.status;

      const code = statusResponse.code ||
                   statusResponse.payload?.code ||
                   statusResponse.data?.code;

      console.log("Extracted - state:", state, "code:", code);

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

      // Update the purchase
      const { error: updateError } = await supabase
        .from("purchase")
        .update({
          status: updateStatus,
          payment_response: statusResponse,
          updated_at: new Date().toISOString()
        })
        .eq("id", purchase.id);

      if (updateError) {
        console.error("Failed to update purchase:", updateError);
        return NextResponse.json(
          {
            error: "Failed to update purchase",
            details: updateError.message,
            currentStatus: purchase.status,
            phonepeResponse: statusResponse
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        transactionId,
        previousStatus: purchase.status,
        currentStatus: updateStatus,
        phonepeResponse: statusResponse,
        message: updateStatus === "success"
          ? "Payment verified and status updated to success!"
          : `Payment status is: ${updateStatus}`
      });
    } catch (error: any) {
      console.error("Error checking payment status:", error);
      return NextResponse.json(
        {
          error: "Failed to check payment status",
          message: error.message,
          currentPurchaseStatus: purchase.status
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Verify pending error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Check payment status using PhonePe V2 Order Status API
 */
async function checkPaymentStatusV2(merchantOrderId: string): Promise<any> {
  const statusBaseUrl = process.env.PHONEPE_STATUS_URL!;
  const accessToken = await getPhonePeAccessToken();

  const url = `${statusBaseUrl}/${merchantOrderId}/status`;
  console.log("Checking payment status at:", url);

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
    console.error("Status check failed:", {
      status: response.status,
      body: errorText
    });
    throw new Error(`Failed to check payment status: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
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
