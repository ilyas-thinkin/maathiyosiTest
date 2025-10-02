import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-side only
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      // No id passed → return all courses
      const { data, error } = await supabaseServer
        .from("courses_mux")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return NextResponse.json(data);
    }

    // With id → fetch one course + lessons
    const { data: course, error: courseError } = await supabaseServer
      .from("courses_mux")
      .select("*")
      .eq("id", id)
      .single();

    if (courseError) throw courseError;
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // fetch lessons
    const { data: lessons, error: lessonError } = await supabaseServer
  .from("course_lessons_mux")
  .select("*")
  .eq("course_id", id)
  .order("lesson_order", { ascending: true });


    if (lessonError) throw lessonError;

    return NextResponse.json({
      ...course,
      lessons: lessons || [],
    });
  } catch (err: any) {
    console.error("🔥 Unexpected API error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
