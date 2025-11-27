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
      body?.merchantOrderId ||
      body?.data?.merchantOrderId ||
      body?.payload?.merchantOrderId;

    const phonepeStatus =
      body?.status ||
      body?.data?.status ||
      body?.state ||
      body?.data?.state ||
      body?.payload?.state;

    const phonepeCode =
      body?.code ||
      body?.data?.code ||
      body?.payload?.code;

    console.log("Webhook - merchantOrderId:", merchantOrderId, "status:", phonepeStatus, "code:", phonepeCode);

    let mappedStatus = "failed"; // default

    if (
      phonepeStatus === "SUCCESS" ||
      phonepeStatus === "PAYMENT_SUCCESS" ||
      phonepeStatus === "COMPLETED" ||
      phonepeCode === "PAYMENT_SUCCESS" ||
      phonepeCode === "SUCCESS"
    ) {
      mappedStatus = "success";
    } else if (
      phonepeStatus === "PENDING" ||
      phonepeStatus === "PAYMENT_PENDING" ||
      phonepeCode === "PAYMENT_PENDING"
    ) {
      mappedStatus = "pending";
    } else if (
      phonepeStatus === "FAILED" ||
      phonepeStatus === "PAYMENT_FAILED" ||
      phonepeCode === "PAYMENT_FAILED" ||
      phonepeCode === "FAILED"
    ) {
      mappedStatus = "failed";
    }

    console.log("Webhook - updating status to:", mappedStatus);

    // Try to update by transaction_id first (which is what we use in initiate)
    const { error: updateError } = await supabase
      .from("purchase")
      .update({
        status: mappedStatus,
        phonepe_txn_id:
          body?.data?.transactionId ||
          body?.transactionId ||
          body?.payload?.transactionId ||
          null,
        raw_response: body,
        updated_at: new Date().toISOString(),
      })
      .eq("transaction_id", merchantOrderId);

    if (updateError) {
      console.error("Webhook - Failed to update purchase:", updateError);
      // Try with merchant_order_id as fallback
      await supabase
        .from("purchase")
        .update({
          status: mappedStatus,
          phonepe_txn_id:
            body?.data?.transactionId ||
            body?.transactionId ||
            body?.payload?.transactionId ||
            null,
          raw_response: body,
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", merchantOrderId);
    } else {
      console.log("Webhook - Successfully updated purchase to status:", mappedStatus);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
