// src/app/api/admin/delete-vimeo-course/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { deleteVimeoVideo, deleteVimeoFolder, extractVimeoVideoId } from '@/app/components/lib/vimeoClient';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const courseId = searchParams.get('id');

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    console.log('Deleting Vimeo course:', courseId);

    // Fetch course details
    const { data: course, error: courseError } = await supabase
      .from('courses_vimeo')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Fetch all lessons for this course
    const { data: lessons } = await supabase
      .from('course_lessons_vimeo')
      .select('vimeo_video_uri')
      .eq('course_id', courseId);

    // Delete all lesson videos from Vimeo
    if (lessons && lessons.length > 0) {
      console.log(`Deleting ${lessons.length} Vimeo videos...`);
      for (const lesson of lessons) {
        try {
          if (lesson.vimeo_video_uri) {
            const videoId = extractVimeoVideoId(lesson.vimeo_video_uri);
            await deleteVimeoVideo(videoId);
            console.log(`Deleted Vimeo video: ${videoId}`);
          }
        } catch (err) {
          console.error('Error deleting Vimeo video:', err);
          // Continue deleting other videos even if one fails
        }
      }
    }

    // Delete Vimeo folder if exists
    if (course.vimeo_folder_id) {
      try {
        await deleteVimeoFolder(course.vimeo_folder_id);
        console.log(`Deleted Vimeo folder: ${course.vimeo_folder_id}`);
      } catch (err) {
        console.error('Error deleting Vimeo folder:', err);
        // Continue even if folder deletion fails
      }
    }

    // Delete lessons from database
    const { error: lessonsDeleteError } = await supabase
      .from('course_lessons_vimeo')
      .delete()
      .eq('course_id', courseId);

    if (lessonsDeleteError) {
      console.error('Error deleting lessons:', lessonsDeleteError);
    }

    // Delete course from database
    const { error: courseDeleteError } = await supabase
      .from('courses_vimeo')
      .delete()
      .eq('id', courseId);

    if (courseDeleteError) {
      throw new Error(`Failed to delete course: ${courseDeleteError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Vimeo course and all associated videos deleted successfully',
    });
  } catch (err: any) {
    console.error('Delete Vimeo course error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
