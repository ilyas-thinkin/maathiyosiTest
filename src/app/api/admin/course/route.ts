  import { NextResponse } from 'next/server';
  import { supabaseServer } from '../../../components/lib/supabaseServer';

  export async function POST(req: Request) {
    try {
      const { title, description, category, price, thumbnail_url } = await req.json();

      const { data, error } = await supabaseServer
        .from('courses_mux')
        .insert([{ title, description, category, price, thumbnail_url }])
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ id: data.id });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
