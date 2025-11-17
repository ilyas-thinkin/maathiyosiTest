export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getPhonePeToken } from "../_token";
import { createClient } from "@supabase/supabase-js";




export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, course_id, amount } = body;

    if (!user_id || !course_id || !amount) {
      return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
    }

    // supabase (server)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const merchantOrderId = `ORD_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // insert pending payment
    const { error } = await supabase.from("purchase").insert({
      user_id,
      course_id,
      amount,
      currency: "INR",
      status: "pending",
      merchant_txn_id: merchantOrderId
    });

    if (error) {
      return NextResponse.json({ success: false, message: "DB Error" }, { status: 500 });
    }

    // get token
    const token = await getPhonePeToken();

    const payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID!,
      merchantOrderId,
      amount: amount * 100, // paise
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?order=${merchantOrderId}`,
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/phonepe/webhook`,
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    const resp = await fetch(process.env.PHONEPE_PAY_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();

    if (!data?.data?.redirectUrl) {
      return NextResponse.json({
        success: false,
        message: "PhonePe create payment failed",
        data
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      redirectUrl: data.data.redirectUrl,
      merchant_txn_id: merchantOrderId
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
