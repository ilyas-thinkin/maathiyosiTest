import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Mux from "@mux/mux-node";

// ✅ Initialize Supabase (Service Role Key)
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Initialize Mux client
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function DELETE(req: Request) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("id");

    if (!courseId) {
      console.error("[DELETE COURSE] Missing course ID in request");
      return NextResponse.json({ error: "Missing course ID" }, { status: 400 });
    }

    console.log(`[DELETE COURSE] Starting deletion for course: ${courseId}`);

    // 🔹 1️⃣ Fetch the course thumbnail
    const { data: course, error: courseError } = await supabaseServer
      .from("courses_mux")
      .select("thumbnail_url")
      .eq("id", courseId)
      .single();
    if (courseError) throw courseError;

    // 🔹 2️⃣ Fetch lessons and Mux asset IDs
    const { data: lessons, error: lessonError } = await supabaseServer
      .from("course_lessons_mux")
      .select("mux_asset_id")
      .eq("course_id", courseId);

    if (lessonError) throw lessonError;

    // 🔹 3️⃣ Delete all Mux assets
    if (lessons && lessons.length > 0) {
      for (const lesson of lessons) {
        const assetId = lesson.mux_asset_id;
        if (!assetId) continue;

        try {
          await mux.video.assets.delete(assetId);
          console.log(`✅ Deleted Mux asset: ${assetId}`);
        } catch (err) {
          console.warn(`⚠️ Failed to delete Mux asset ${assetId}:`, err);
        }
      }
    }

    // 🔹 4️⃣ Delete course thumbnail from Supabase Storage
    if (course?.thumbnail_url) {
      const path = course.thumbnail_url.split(
        "/storage/v1/object/public/course_thumbnails/"
      )[1];
      if (path) {
        await supabaseServer.storage.from("course_thumbnails").remove([path]);
        console.log(`🧹 Deleted thumbnail: ${path}`);
      }
    }

    // 🔹 5️⃣ Delete lessons linked to the course
    const { error: lessonsDeleteError } = await supabaseServer
      .from("course_lessons_mux")
      .delete()
      .eq("course_id", courseId);
    if (lessonsDeleteError) throw lessonsDeleteError;

    // 🔹 6️⃣ Delete the course itself
    const { error: deleteError } = await supabaseServer
      .from("courses_mux")
      .delete()
      .eq("id", courseId);
    if (deleteError) throw deleteError;

    const duration = Date.now() - startTime;
    console.log(`[DELETE COURSE] Course deleted successfully: ${courseId} (${duration}ms)`);

    return NextResponse.json({
      success: true,
      message: "Course, lessons, and all assets deleted successfully",
      durationMs: duration
    });
  } catch (err: any) {
    console.error("[DELETE COURSE] Critical error:", err.message);
    console.error("[DELETE COURSE] Stack trace:", err.stack);
    return NextResponse.json({
      error: err.message,
      details: process.env.NODE_ENV === "development" ? err.stack : undefined
    }, { status: 500 });
  }
}
