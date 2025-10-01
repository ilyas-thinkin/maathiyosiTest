import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // only server-side
);

export async function GET() {
  try {
    console.log("🔍 Fetching courses_mux...");
    const { data, error } = await supabaseServer
      .from("courses_mux")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 500 }
      );
    }

    console.log("✅ Data returned:", data?.length);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("🔥 Unexpected API error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
