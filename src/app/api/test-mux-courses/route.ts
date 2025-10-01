import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Use the service role key
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Fetch all rows
    const { data, error, count } = await supabaseServer
      .from("courses_mux")
      .select("*", { count: "exact" });

    console.log("Test fetch-mux-courses data:", data);
    console.log("Test fetch-mux-courses error:", error);
    console.log("Row count:", count);

    if (error) throw error;

    // Return data + meta info
    return NextResponse.json({
      rowCount: count,
      columns: data?.length ? Object.keys(data[0]) : [],
      data,
    });
  } catch (err: any) {
    console.error("Test fetch-mux-courses API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
