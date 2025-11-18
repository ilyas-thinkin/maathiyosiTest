// src/app/api/purchase/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { amount, user_id, course_id, currency = "INR" } = await req.json();

    if (!amount || !user_id || !course_id) {
      return NextResponse.json(
        { error: "amount, user_id and course_id are required" },
        { status: 400 }
      );
    }

    const merchantOrderId = `MAATH-${Date.now()}-${Math.floor(
      Math.random() * 10000
    )}`;

    const newOrder = {
      user_id,
      course_id,
      amount,
      currency,
      status: "pending",            // ✔ MATCHING DB CHECK
      merchant_order_id: merchantOrderId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("purchase").insert(newOrder);

    if (error) throw error;

    return NextResponse.json({ merchantOrderId, amount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
