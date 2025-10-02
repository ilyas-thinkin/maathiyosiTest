import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Move client creation inside the function to avoid build-time issues
function getSupabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  req: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    const supabaseServer = getSupabaseServer();

    const { data: course, error: courseError } = await supabaseServer
      .from("courses_mux")
      .select("*")
      .eq("id", id)
      .single();

    if (courseError) {
      return NextResponse.json({ error: courseError.message }, { status: 500 });
    }

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const { data: lessons, error: lessonsError } = await supabaseServer
      .from("course_lessons_mux")
      .select("*")
      .eq("course_id", id)
      .order("id", { ascending: true });

    if (lessonsError) {
      return NextResponse.json({ error: lessonsError.message }, { status: 500 });
    }

    return NextResponse.json({ ...course, lessons });
  } catch (err: any) {
    console.error("fetch-mux-edit-course API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}