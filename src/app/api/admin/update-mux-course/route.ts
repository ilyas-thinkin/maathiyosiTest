import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Mux from "@mux/mux-node";

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Mux client for video deletion
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

// Helper to extract Mux asset ID from video URL
const extractMuxAssetId = (url: string): string | null => {
  if (!url) return null;
  // Extract playback ID from URL like https://stream.mux.com/{playbackId}.m3u8
  const match = url.match(/stream\.mux\.com\/([^/.]+)/);
  return match ? match[1] : null;
};

// Helper to delete Mux video by playback ID
const deleteMuxVideoByPlaybackId = async (playbackId: string): Promise<boolean> => {
  try {
    console.log(`[MUX DELETE] Searching for asset with playback ID: ${playbackId}`);

    const assetsPage = await mux.video.assets.list({ limit: 100 });

    for await (const asset of assetsPage) {
      const hasMatchingPlaybackId = asset.playback_ids?.some(
        (p: any) => p.id === playbackId
      );

      if (hasMatchingPlaybackId) {
        await mux.video.assets.delete(asset.id);
        console.log(`[MUX DELETE] Successfully deleted asset: ${asset.id}`);
        return true;
      }
    }

    console.log(`[MUX DELETE] Asset not found for playback ID: ${playbackId}`);
    return false;
  } catch (error: any) {
    console.error(`[MUX DELETE] Error deleting asset: ${error.message}`);
    return false;
  }
};

type LessonInput = {
  id?: string;
  title: string;
  description?: string;
  mux_video_id?: string;
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

    // 4️⃣ Delete removed lessons and their Mux videos
    const lessonsToDelete = existingLessonIds.filter((id) => !sentLessonIds.includes(id));
    if (lessonsToDelete.length > 0) {
      console.log(`[UPDATE COURSE] Deleting ${lessonsToDelete.length} removed lessons`);

      // First, fetch the lessons to get their Mux video URLs
      const { data: lessonsToRemove, error: fetchError } = await supabaseServer
        .from("course_lessons_mux")
        .select("id, mux_video_id, title")
        .in("id", lessonsToDelete);

      if (fetchError) {
        console.error("[UPDATE COURSE] Error fetching lessons to delete:", fetchError);
      } else if (lessonsToRemove && lessonsToRemove.length > 0) {
        // Delete Mux videos for each removed lesson
        for (const lesson of lessonsToRemove) {
          if (lesson.mux_video_id) {
            const playbackId = extractMuxAssetId(lesson.mux_video_id);
            if (playbackId) {
              console.log(`[UPDATE COURSE] Deleting Mux video for lesson "${lesson.title}" (playback ID: ${playbackId})`);
              await deleteMuxVideoByPlaybackId(playbackId);
            }
          }
        }
      }

      // Now delete the lesson records from database
      const { error: deleteError } = await supabaseServer
        .from("course_lessons_mux")
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
        .from("course_lessons_mux")
        .update({
          title: l.title,
          description: l.description ?? null,
          mux_video_id: l.mux_video_id ?? null,
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
        mux_video_id: l.mux_video_id ?? null,
        document_url: l.document_url ?? null,
        lesson_order: l.lesson_order ?? 0,
      }));

      const { error: insertError } = await supabaseServer
        .from("course_lessons_mux")
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