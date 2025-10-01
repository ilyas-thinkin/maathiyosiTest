import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type LessonInput = {
  id?: string; // existing lesson id or undefined for new lessons
  title: string;
  description?: string;
  video_url?: string;
  document_url?: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id: courseId, title, description, category, price, thumbnail_url, lessons } = body;

    if (!courseId) return NextResponse.json({ error: "Missing course ID" }, { status: 400 });
    if (!title) return NextResponse.json({ error: "Missing course title" }, { status: 400 });

    // 1️⃣ Update the course
    const { error: courseError } = await supabaseServer
      .from("courses_mux")
      .update({
        title,
        description: description ?? null,
        category: category ?? null,
        price: price ?? null,
        thumbnail_url: thumbnail_url ?? null,
      })
      .eq("id", courseId);

    if (courseError) {
      console.error("Update course error:", courseError);
      return NextResponse.json({ error: courseError.message }, { status: 500 });
    }

    // 2️⃣ Fetch existing lessons for this course
    const { data: existingLessons, error: existingError } = await supabaseServer
      .from("course_lessons_mux")
      .select("id")
      .eq("course_id", courseId);

    if (existingError) {
      console.error("Fetch existing lessons error:", existingError);
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    const existingLessonIds = existingLessons?.map((l: any) => l.id) || [];

    // 3️⃣ Separate lessons into update vs insert
    const lessonsToUpdate: LessonInput[] = [];
    const lessonsToInsert: LessonInput[] = [];
    const sentLessonIds: string[] = [];

    for (const l of lessons) {
      if (l.id && existingLessonIds.includes(l.id)) {
        lessonsToUpdate.push(l);
        sentLessonIds.push(l.id);
      } else {
        lessonsToInsert.push(l);
      }
    }

    // 4️⃣ Delete removed lessons
    const lessonsToDelete = existingLessonIds.filter((id) => !sentLessonIds.includes(id));
    if (lessonsToDelete.length > 0) {
      const { error: deleteError } = await supabaseServer
        .from("course_lessons_mux")
        .delete()
        .in("id", lessonsToDelete);
      if (deleteError) console.error("Delete lessons error:", deleteError);
    }

    // 5️⃣ Update existing lessons
    for (const l of lessonsToUpdate) {
      const { error: updateError } = await supabaseServer
        .from("course_lessons_mux")
        .update({
          title: l.title,
          description: l.description ?? null,
          mux_video_id: l.video_url ?? null,
          document_url: l.document_url ?? null,
        })
        .eq("id", l.id);
      if (updateError) console.error("Update lesson error:", updateError);
    }

    // 6️⃣ Insert new lessons
    if (lessonsToInsert.length > 0) {
      const insertRows = lessonsToInsert.map((l) => ({
        course_id: courseId,
        title: l.title,
        description: l.description ?? null,
        mux_video_id: l.video_url ?? null,
        document_url: l.document_url ?? null,
      }));

      const { error: insertError } = await supabaseServer
        .from("course_lessons_mux")
        .insert(insertRows);

      if (insertError) console.error("Insert new lessons error:", insertError);
    }

    return NextResponse.json({ message: "Course and lessons updated successfully" });
  } catch (err: any) {
    console.error("update-mux-course error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
