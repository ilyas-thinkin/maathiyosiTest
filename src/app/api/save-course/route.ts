// src/app/api/save-course/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // SERVICE ROLE key (server-only)
);

type LessonInput = {
  title: string;
  description?: string;
  mux_video_id?: string | null;
  document_url?: string | null;
  duration?: number | null;
  lesson_order: number; // <-- new field
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, category, price, thumbnail_url, lessons } = body;

    if (!title) return NextResponse.json({ error: 'Missing title' }, { status: 400 });

    // Insert course
    const { data: courseData, error: courseError } = await supabaseServer
      .from('courses_mux')
      .insert([
        {
          title,
          description: description ?? null,
          category: category ?? null,
          price: price ?? null,
          thumbnail_url: thumbnail_url ?? null,
        },
      ])
      .select('id')
      .single();

    if (courseError || !courseData) {
      console.error('Insert course error:', courseError);
      return NextResponse.json(
        { error: courseError?.message || 'Failed to insert course', details: courseError },
        { status: 500 }
      );
    }

    const courseId = courseData.id;

    // Insert lessons in bulk (if any)
    if (Array.isArray(lessons) && lessons.length > 0) {
      const lessonRows = lessons.map((l: LessonInput, index: number) => ({
        course_id: courseId,
        title: l.title,
        description: l.description ?? null,
        duration: l.duration ?? null,
        mux_video_id: l.mux_video_id ?? null,
        document_url: l.document_url ?? null,
        lesson_order: index + 1, // <-- save order based on array index
      }));

      const { error: lessonsError } = await supabaseServer
        .from('course_lessons_mux')
        .insert(lessonRows);

      if (lessonsError) {
        console.error('Insert lessons error:', lessonsError);
        return NextResponse.json(
          { error: lessonsError.message, details: lessonsError },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ id: courseId, message: 'Course saved successfully' });
  } catch (err: any) {
    console.error('save-course error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
