// src/app/api/admin/fetch-vimeo-courses/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: courses, error } = await supabase
      .from('courses_vimeo')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch Vimeo courses error:', error);
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      data: courses || [],
    });
  } catch (err: any) {
    console.error('Fetch Vimeo courses error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
