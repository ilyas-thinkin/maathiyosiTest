// src/app/api/phonepe/webhook/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const raw = await req.text();

    const signature =
      req.headers.get("X-PHONEPE-SIGNATURE") ||
      req.headers.get("x-verify") ||
      req.headers.get("x-signature");

    const expected = crypto
      .createHmac("sha256", process.env.PHONEPE_CLIENT_SECRET!)
      .update(raw)
      .digest("hex");

    if (signature !== expected) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const body = JSON.parse(raw);

    const merchantOrderId =
      body?.merchantOrderId || body?.data?.merchantOrderId;

    const phonepeStatus =
      body?.status || body?.data?.status;

    let mappedStatus = "failed"; // default

    if (
      phonepeStatus === "SUCCESS" ||
      phonepeStatus === "PAYMENT_SUCCESS"
    ) {
      mappedStatus = "success";
    } else if (
      phonepeStatus === "PENDING" ||
      phonepeStatus === "PAYMENT_PENDING"
    ) {
      mappedStatus = "pending";
    }

    await supabase
      .from("purchase")
      .update({
        status: mappedStatus,
        phonepe_txn_id:
          body?.data?.transactionId ||
          body?.transactionId ||
          null,
        raw_response: body,
        updated_at: new Date().toISOString(),
      })
      .eq("merchant_order_id", merchantOrderId);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
