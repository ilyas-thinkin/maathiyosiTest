import { NextResponse } from "next/server";
import { supabaseServer } from "@/app/components/lib/supabaseServer";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("courses_mux")
      .select("id, title, description, price, category, thumbnail_url, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching mux courses:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
