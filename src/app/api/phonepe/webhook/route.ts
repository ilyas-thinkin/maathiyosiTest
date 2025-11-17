import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getPhonePeToken } from "../_token";

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    let json: any = {};

    try { json = JSON.parse(raw); } catch {}

    const merchantOrderId =
      json["merchantOrderId"] ??
      json["orderId"] ??
      json?.data?.merchantOrderId;

    if (!merchantOrderId) {
      return NextResponse.json({ success: false });
    }

    // verify via status API
    const token = await getPhonePeToken();

    const statusUrl = `${process.env.PHONEPE_STATUS_URL!}/${merchantOrderId}/status`;

    const resp = await fetch(statusUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const statusJson = await resp.json();

    const state =
      statusJson?.data?.state ??
      statusJson?.data?.status ??
      statusJson?.orderStatus;

    const finalStatus =
      ["SUCCESS", "COMPLETED", "PAID"].includes(String(state).toUpperCase())
        ? "success"
        : "failed";

    // update database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    await supabase
      .from("purchase")
      .update({
        status: finalStatus,
        phonepe_txn_id: statusJson?.data?.transactionId ?? null,
        raw_response: statusJson,
        updated_at: new Date().toISOString()
      })
      .eq("merchant_txn_id", merchantOrderId);

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
