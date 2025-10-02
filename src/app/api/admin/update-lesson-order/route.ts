import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type LessonOrderInput = {
  id: string;
  lesson_order: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lessons } = body as { lessons: LessonOrderInput[] };

    console.log("Received lesson order update request:", lessons);

    if (!Array.isArray(lessons) || lessons.length === 0) {
      return NextResponse.json({ error: "No lessons provided" }, { status: 400 });
    }

    // Update each lesson's order in Supabase
    const updatePromises = lessons.map((lesson) => 
      supabaseServer
        .from("course_lessons_mux")
        .update({ lesson_order: lesson.lesson_order })
        .eq("id", lesson.id)
    );

    const results = await Promise.all(updatePromises);

    // Check for any errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error("Failed to update some lessons:", errors);
      return NextResponse.json({ 
        error: "Failed to update some lesson orders",
        details: errors 
      }, { status: 500 });
    }

    console.log("All lesson orders updated successfully");
    return NextResponse.json({ 
      message: "Lesson order updated successfully",
      updated: lessons.length 
    });
  } catch (err: any) {
    console.error("update-lesson-order error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}