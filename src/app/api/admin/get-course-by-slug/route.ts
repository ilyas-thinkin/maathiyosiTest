// src/app/api/admin/get-course-by-slug/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'slug parameter is required' },
        { status: 400 }
      );
    }

    // Check Vimeo courses first (as per user preference)
    const { data: vimeoCourse, error: vimeoError } = await supabaseServer
      .from('courses_vimeo')
      .select('id, title, slug')
      .eq('slug', slug)
      .maybeSingle();

    if (vimeoCourse) {
      return NextResponse.json({
        id: vimeoCourse.id,
        title: vimeoCourse.title,
        slug: vimeoCourse.slug,
        source: 'vimeo',
        exists: true
      });
    }

    // If not found in Vimeo, check Mux courses
    const { data: muxCourse, error: muxError } = await supabaseServer
      .from('courses_mux')
      .select('id, title, slug')
      .eq('slug', slug)
      .maybeSingle();

    if (muxCourse) {
      return NextResponse.json({
        id: muxCourse.id,
        title: muxCourse.title,
        slug: muxCourse.slug,
        source: 'mux',
        exists: true
      });
    }

    // Course not found
    return NextResponse.json(
      { error: 'Course not found', exists: false },
      { status: 404 }
    );
  } catch (err: any) {
    console.error('get-course-by-slug error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
