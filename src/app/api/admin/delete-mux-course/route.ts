import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Use Service Role Key
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing course ID" }, { status: 400 });

    // Fetch thumbnail URL to delete from storage
    const { data: course, error: courseError } = await supabaseServer
      .from("courses_mux")
      .select("thumbnail_url")
      .eq("id", id)
      .single();

    if (courseError) throw courseError;

    // Delete thumbnail if exists
    if (course?.thumbnail_url) {
      const path = course.thumbnail_url.split("/storage/v1/object/public/course_thumbnails/")[1];
      if (path) {
        await supabaseServer.storage.from("course_thumbnails").remove([path]);
      }
    }

    // Delete the course (and lessons if cascade is set)
    const { error: deleteError } = await supabaseServer
      .from("courses_mux")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (err: any) {
    console.error("Delete Mux course error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
