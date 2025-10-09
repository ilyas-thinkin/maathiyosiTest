import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role key
);

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("hero_slides_new")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error("fetch-hero-slides-new error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
