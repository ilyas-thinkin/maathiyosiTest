// src/app/api/admin/create-vimeo-course/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      category,
      price,
      thumbnail_url,
      vimeo_folder_id,
      vimeo_folder_uri,
      lessons
    } = body;

    if (!title || !description || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Creating Vimeo course:', title);

    // Insert course into courses_vimeo table
    const { data: course, error: courseError } = await supabase
      .from('courses_vimeo')
      .insert({
        title,
        description,
        category: category || 'Uncategorized',
        price: parseFloat(price),
        thumbnail_url: thumbnail_url || '',
        vimeo_folder_id: vimeo_folder_id || null,
        vimeo_folder_uri: vimeo_folder_uri || null,
      })
      .select()
      .single();

    if (courseError) {
      console.error('Course insert error:', courseError);
      throw new Error(`Failed to create course: ${courseError.message}`);
    }

    console.log('Course created with ID:', course.id);

    // Insert lessons if provided
    if (lessons && lessons.length > 0) {
      const lessonsToInsert = lessons.map((lesson: any, index: number) => ({
        course_id: course.id,
        title: lesson.title,
        description: lesson.description || '',
        vimeo_video_id: lesson.vimeo_video_id,
        vimeo_video_uri: lesson.vimeo_video_uri,
        vimeo_player_url: lesson.vimeo_player_url,
        document_url: lesson.document_url || null,
        duration: lesson.duration || 0,
        lesson_order: lesson.lesson_order !== undefined ? lesson.lesson_order : index,
      }));

      const { error: lessonsError } = await supabase
        .from('course_lessons_vimeo')
        .insert(lessonsToInsert);

      if (lessonsError) {
        console.error('Lessons insert error:', lessonsError);
        // Try to delete the course if lessons failed
        await supabase.from('courses_vimeo').delete().eq('id', course.id);
        throw new Error(`Failed to create lessons: ${lessonsError.message}`);
      }

      console.log(`${lessons.length} lessons created`);
    }

    return NextResponse.json({
      success: true,
      course: course,
      message: 'Vimeo course created successfully',
    });
  } catch (err: any) {
    console.error('Create Vimeo course error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
