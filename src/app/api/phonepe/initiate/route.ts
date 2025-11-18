// app/api/phonepe/initiate/route.ts - PhonePe V2 API
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { courseId, userId } = await req.json();

    if (!courseId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: courseId and userId" },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.PHONEPE_CLIENT_ID || !process.env.PHONEPE_CLIENT_SECRET || !process.env.PHONEPE_PAY_URL) {
      console.error("Missing PhonePe V2 configuration");
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    // Fetch course details from courses_mux table to get the actual price
    const { data: courseData, error: courseError } = await supabase
      .from("courses_mux")
      .select("id, title, price")
      .eq("id", courseId)
      .single();

    if (courseError || !courseData) {
      console.error("Course not found:", courseError);
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    if (!courseData.price || courseData.price <= 0) {
      return NextResponse.json(
        { error: "Invalid course price" },
        { status: 400 }
      );
    }

    // Generate unique merchant order ID
    const merchantOrderId = `ORDER_${Date.now()}_${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // Create purchase record in database
    const { data: purchaseData, error: dbError } = await supabase
      .from("purchase")
      .insert({
        user_id: userId,
        course_id: courseId,
        amount: courseData.price,
        status: "pending",
        transaction_id: merchantOrderId,
        order_id: merchantOrderId,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to create purchase record", details: dbError.message },
        { status: 500 }
      );
    }

    // Get OAuth access token for PhonePe V2 API
    const accessToken = await getPhonePeAccessToken();

    // Create payment request payload for PhonePe V2 API
    const paymentPayload = {
      merchantOrderId: merchantOrderId,
      amount: Math.round(courseData.price * 100), // Convert to paise
      paymentFlow: {
        type: "PG_CHECKOUT",
        merchantUrls: {
          // Include merchantOrderId in redirect URL so callback can identify the transaction
          redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/phonepe/callback?merchantOrderId=${merchantOrderId}`
        }
      },
      expireAfter: 1800, // 30 minutes
      metaInfo: {
        udf1: courseId,
        udf2: courseData.title,
        udf3: purchaseData.id
      }
    };

    console.log("PhonePe V2 Payment Request:", {
      merchantOrderId,
      amount: paymentPayload.amount,
      coursePrice: courseData.price,
      courseName: courseData.title
    });

    // Make payment request to PhonePe V2 API
    const paymentResponse = await fetch(process.env.PHONEPE_PAY_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `O-Bearer ${accessToken}`,
        "Accept": "application/json"
      },
      body: JSON.stringify(paymentPayload),
    });

    const paymentData = await paymentResponse.json();

    console.log("PhonePe V2 Payment Response:", JSON.stringify(paymentData, null, 2));

    if (!paymentResponse.ok) {
      // Update purchase status to failed
      await supabase
        .from("purchase")
        .update({
          status: "failed",
          payment_response: paymentData
        })
        .eq("id", purchaseData.id);

      return NextResponse.json(
        {
          error: "Failed to initiate payment",
          details: paymentData,
          message: paymentData.message || paymentData.error || "Payment initiation failed"
        },
        { status: paymentResponse.status || 400 }
      );
    }

    // Extract payment URL from V2 response
    // V2 API may return different response structure
    let paymentUrl = paymentData.redirectUrl || paymentData.paymentUrl || paymentData.url;

    if (!paymentUrl && paymentData.data) {
      paymentUrl = paymentData.data.redirectUrl || paymentData.data.paymentUrl || paymentData.data.url;
    }

    if (!paymentUrl) {
      // Update purchase status to failed
      await supabase
        .from("purchase")
        .update({
          status: "failed",
          payment_response: paymentData
        })
        .eq("id", purchaseData.id);

      return NextResponse.json(
        {
          error: "Payment URL not found in response",
          details: paymentData
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentUrl: paymentUrl,
      transactionId: merchantOrderId,
      purchaseId: purchaseData.id,
      amount: courseData.price
    });
  } catch (error: any) {
    console.error("PhonePe V2 Initiate Error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Get OAuth access token for PhonePe V2 API
 * Uses client_id and client_secret to get O-Bearer token
 */
async function getPhonePeAccessToken(): Promise<string> {
  const tokenUrl = process.env.PHONEPE_TOKEN_URL!;
  const clientId = process.env.PHONEPE_CLIENT_ID!;
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET!;
  const clientVersion = process.env.PHONEPE_CLIENT_VERSION || "1";

  console.log("Requesting PhonePe OAuth token...", {
    tokenUrl,
    clientIdLength: clientId?.length,
    clientSecretLength: clientSecret?.length,
    clientVersion,
    hasTokenUrl: !!tokenUrl,
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret
  });

  // PhonePe v2 requires form data in body (as per customer support example)
  const formBody = new URLSearchParams({
    client_id: clientId,
    client_version: clientVersion,
    client_secret: clientSecret,
    grant_type: "client_credentials"
  });

  console.log("OAuth request to:", tokenUrl);
  console.log("Form data (masked):", {
    client_id: clientId.substring(0, 10) + "...",
    client_version: clientVersion,
    grant_type: "client_credentials"
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formBody.toString(),
  });

  const responseText = await response.text();

  console.log("PhonePe OAuth Response:", {
    status: response.status,
    statusText: response.statusText,
    body: responseText
  });

  if (!response.ok) {
    console.error("PhonePe V2 OAuth Error:", {
      status: response.status,
      statusText: response.statusText,
      body: responseText,
      credentials: {
        clientId: clientId,
        clientIdMasked: clientId ? `${clientId.substring(0, 10)}...` : 'missing',
        clientVersion: clientVersion,
        tokenUrl: tokenUrl
      }
    });
    throw new Error(`Failed to get PhonePe OAuth token: ${response.status} ${responseText}`);
  }

  const data = JSON.parse(responseText);

  if (!data.access_token) {
    console.error("PhonePe V2 OAuth - No access token in response:", data);
    throw new Error("No access token in OAuth response");
  }

  console.log("PhonePe V2 OAuth Token obtained successfully");
  return data.access_token;
}