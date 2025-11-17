// app/api/phonepe/initiate/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PHONEPE_BASE = process.env.PHONEPE_BASE_URL!;
const CLIENT_ID = process.env.PHONEPE_CLIENT_ID!;
const CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET!;
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID!;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!PHONEPE_BASE || !CLIENT_ID || !CLIENT_SECRET || !MERCHANT_ID) {
  console.error("Missing PhonePe env vars");
}

// simple in-memory token cache (note: serverless may re-instantiate; still fine)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getPhonePeToken() {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 5000) {
    return cachedToken.token;
  }

  // V2 authorize endpoint (per PhonePe support)
  const authPath = "/pg/v2/authorize"; // verify exact path in PhonePe docs; adjust if needed
  const resp = await fetch(`${PHONEPE_BASE}${authPath}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    }),
  });

  const json = await resp.json();
  if (!resp.ok) throw new Error(`Token request failed: ${JSON.stringify(json)}`);

  // expected: { success: true, accessToken: "...", expiresIn: 3600 }
  const token = json?.accessToken || json?.data?.accessToken || json?.token;
  const expiresIn = json?.expiresIn || json?.data?.expiresIn || 3600;

  if (!token) throw new Error("PhonePe token not found in response");

  cachedToken = { token, expiresAt: Date.now() + expiresIn * 1000 };
  return token;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, course_id, amount } = body;

    if (!user_id || !course_id || !amount) {
      return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
    }

    // server supabase client (service role)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // generate merchant order id (unique)
    const merchantOrderId = `ORD_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    // insert pending purchase
    const { error: insertError } = await supabase.from("purchase").insert({
      user_id,
      course_id,
      amount,
      currency: "INR",
      status: "pending",
      merchant_txn_id: merchantOrderId,
    });

    if (insertError) {
      console.error("DB insert error", insertError);
      return NextResponse.json({ success: false, message: "DB insert failed" }, { status: 500 });
    }

    // get access token
    const token = await getPhonePeToken();

    // Create Payment (V3 per PhonePe support)
    const createPath = "/pg/v3/pay"; // verify path in docs; change if docs differ
    // PhonePe expects amount in paise (integer)
    const amountPaise = Math.round(Number(amount) * 100);

    const createPayload = {
      merchantOrderId,           // your order id
      merchantId: MERCHANT_ID,   // M... merchant id
      amount: amountPaise,
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/phonepe/webhook`,
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?order=${merchantOrderId}`,
      paymentInstrument: { type: "PAY_PAGE" }, // redirect flow
      // optional: customer details, product info, etc.
    };

    const createResp = await fetch(`${PHONEPE_BASE}${createPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(createPayload),
    });

    const createJson = await createResp.json();

    if (!createResp.ok) {
      console.error("PhonePe CreatePayment failed:", createJson);
      return NextResponse.json({ success: false, message: "PhonePe create payment failed", createJson }, { status: 500 });
    }

    // response should include a redirect URL. adjust path below per actual response shape
    const redirectUrl =
      createJson?.data?.redirectUrl ||
      createJson?.data?.instrumentResponse?.redirectInfo?.url ||
      createJson?.redirectUrl ||
      createJson?.paymentUrl ||
      null;

    if (!redirectUrl) {
      console.error("No redirect URL in PhonePe create payment response:", createJson);
      return NextResponse.json({ success: false, message: "No redirect URL from PhonePe", createJson }, { status: 500 });
    }

    return NextResponse.json({ success: true, redirectUrl, merchant_txn_id: merchantOrderId });
  } catch (err: any) {
    console.error("Initiate error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
