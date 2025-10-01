import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../components/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    const filePath = `thumbnails/${Date.now()}_${file.name}`;

    const { data, error } = await supabaseServer.storage
      .from('course_thumbnails')
      .upload(filePath, file, { upsert: true });

    if (error) throw error;

    const { data: urlData } = supabaseServer.storage
      .from('course_thumbnails')
      .getPublicUrl(filePath);

    return NextResponse.json({ publicUrl: urlData.publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
