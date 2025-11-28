import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    // Check if course exists in Mux table
    const { data: muxCourse } = await supabaseServer
      .from("courses_mux")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (muxCourse) {
      return NextResponse.json({ source: "mux", exists: true });
    }

    // Check if course exists in Vimeo table
    const { data: vimeoCourse } = await supabaseServer
      .from("courses_vimeo")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (vimeoCourse) {
      return NextResponse.json({ source: "vimeo", exists: true });
    }

    return NextResponse.json({ error: "Course not found", exists: false }, { status: 404 });
  } catch (err: any) {
    console.error("get-course-source API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
