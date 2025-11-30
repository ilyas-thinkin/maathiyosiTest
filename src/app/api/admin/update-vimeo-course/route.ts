import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { deleteVimeoVideo, extractVimeoVideoId } from "@/app/components/lib/vimeoClient";

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to extract Vimeo video ID from URI or URL
const extractVideoId = (uriOrUrl: string): string | null => {
  if (!uriOrUrl) return null;

  // If it's a URI like /videos/123456, extract the ID
  if (uriOrUrl.startsWith('/videos/')) {
    return extractVimeoVideoId(uriOrUrl);
  }

  // If it's a full URL, try to extract the video ID from various Vimeo URL formats
  const match = uriOrUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
};

// Helper to delete Vimeo video by URI or URL
const deleteVimeoVideoByUri = async (uri: string): Promise<boolean> => {
  try {
    const videoId = extractVideoId(uri);
    if (!videoId) {
      console.log(`[VIMEO DELETE] Could not extract video ID from URI: ${uri}`);
      return false;
    }

    console.log(`[VIMEO DELETE] Deleting video with ID: ${videoId}`);
    await deleteVimeoVideo(videoId);
    console.log(`[VIMEO DELETE] Successfully deleted video: ${videoId}`);
    return true;
  } catch (error: any) {
    console.error(`[VIMEO DELETE] Error deleting video: ${error.message}`);
    return false;
  }
};

type LessonInput = {
  id?: string;
  title: string;
  description?: string;
  vimeo_video_id?: string;
  vimeo_player_url?: string;
  vimeo_video_uri?: string;
  document_url?: string;
  lesson_order?: number;
};

export async function POST(req: Request) {
  const startTime = Date.now();
  console.log("[UPDATE COURSE] Starting course update...");

  try {
    const body = await req.json();
    const { id: courseId, title, description, category, price, thumbnail_url, lessons } = body;

    console.log(`[UPDATE COURSE] Course ID: ${courseId}, Title: ${title}, Lessons count: ${lessons?.length || 0}`);

    if (!courseId) {
      console.error("[UPDATE COURSE] Missing course ID");
      return NextResponse.json({ error: "Missing course ID" }, { status: 400 });
    }
    if (!title) {
      console.error("[UPDATE COURSE] Missing course title");
      return NextResponse.json({ error: "Missing course title" }, { status: 400 });
    }

    // 1️⃣ Update the course
    const { error: courseError } = await supabaseServer
      .from("courses_vimeo")
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
      .from("course_lessons_vimeo")
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

    lessons.forEach((l: LessonInput, index: number) => {
      // Ensure lesson_order is set from the array index if not provided
      if (l.lesson_order === undefined) {
        l.lesson_order = index;
      }

      if (l.id && existingLessonIds.includes(l.id)) {
        lessonsToUpdate.push(l);
        sentLessonIds.push(l.id);
      } else {
        lessonsToInsert.push(l);
      }
    });

    // 4️⃣ Delete removed lessons and their Vimeo videos
    const lessonsToDelete = existingLessonIds.filter((id) => !sentLessonIds.includes(id));
    if (lessonsToDelete.length > 0) {
      console.log(`[UPDATE COURSE] Deleting ${lessonsToDelete.length} removed lessons`);

      // First, fetch the lessons to get their Vimeo video URIs
      const { data: lessonsToRemove, error: fetchError } = await supabaseServer
        .from("course_lessons_vimeo")
        .select("id, vimeo_video_uri, title")
        .in("id", lessonsToDelete);

      if (fetchError) {
        console.error("[UPDATE COURSE] Error fetching lessons to delete:", fetchError);
      } else if (lessonsToRemove && lessonsToRemove.length > 0) {
        // Delete Vimeo videos for each removed lesson
        for (const lesson of lessonsToRemove) {
          if (lesson.vimeo_video_uri) {
            console.log(`[UPDATE COURSE] Deleting Vimeo video for lesson "${lesson.title}" (URI: ${lesson.vimeo_video_uri})`);
            await deleteVimeoVideoByUri(lesson.vimeo_video_uri);
          }
        }
      }

      // Now delete the lesson records from database
      const { error: deleteError } = await supabaseServer
        .from("course_lessons_vimeo")
        .delete()
        .in("id", lessonsToDelete);

      if (deleteError) {
        console.error("[UPDATE COURSE] Delete lessons error:", deleteError);
      } else {
        console.log(`[UPDATE COURSE] Successfully deleted ${lessonsToDelete.length} lessons from database`);
      }
    }

    // 5️⃣ Update existing lessons
    for (const l of lessonsToUpdate) {
      const { error: updateError } = await supabaseServer
        .from("course_lessons_vimeo")
        .update({
          title: l.title,
          description: l.description ?? null,
          vimeo_video_id: l.vimeo_video_id ?? null,
          vimeo_player_url: l.vimeo_player_url ?? null,
          vimeo_video_uri: l.vimeo_video_uri ?? null,
          document_url: l.document_url ?? null,
          lesson_order: l.lesson_order ?? 0,
        })
        .eq("id", l.id);
      if (updateError) {
        console.error("Update lesson error:", updateError);
        return NextResponse.json({ error: `Failed to update lesson ${l.id}` }, { status: 500 });
      }
    }

    // 6️⃣ Insert new lessons
    if (lessonsToInsert.length > 0) {
      const insertRows = lessonsToInsert.map((l) => ({
        course_id: courseId,
        title: l.title,
        description: l.description ?? null,
        vimeo_video_id: l.vimeo_video_id ?? null,
        vimeo_player_url: l.vimeo_player_url ?? null,
        vimeo_video_uri: l.vimeo_video_uri ?? null,
        document_url: l.document_url ?? null,
        lesson_order: l.lesson_order ?? 0,
      }));

      const { error: insertError } = await supabaseServer
        .from("course_lessons_vimeo")
        .insert(insertRows);

      if (insertError) {
        console.error("Insert new lessons error:", insertError);
        return NextResponse.json({ error: "Failed to insert new lessons" }, { status: 500 });
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[UPDATE COURSE] Course update completed successfully in ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: "Course and lessons updated successfully",
      stats: {
        lessonsUpdated: lessonsToUpdate.length,
        lessonsInserted: lessonsToInsert.length,
        lessonsDeleted: lessonsToDelete.length,
        durationMs: duration
      }
    });
  } catch (err: any) {
    console.error("[UPDATE COURSE] Critical error:", err);
    console.error("[UPDATE COURSE] Stack trace:", err.stack);
    return NextResponse.json({
      error: err.message || "Server error",
      details: process.env.NODE_ENV === "development" ? err.stack : undefined
    }, { status: 500 });
  }
}
