import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../components/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const { courseId, title, description, mux_video_id_or_url, document_url } = await req.json();

    const { data, error } = await supabaseServer
      .from('course_lessons_mux')
      .insert([{ course_id: courseId, title, description, mux_video_id_or_url, document_url }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
