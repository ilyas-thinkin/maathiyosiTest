import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { user_id, course_id, payment_id, status } = await req.json();
    const { data, error } = await supabase.from("purchases").insert([
      { user_id, course_id, payment_id, status },
    ]);

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to record purchase" }, { status: 500 });
  }
}
