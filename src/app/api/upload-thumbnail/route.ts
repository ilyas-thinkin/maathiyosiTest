// src/app/api/upload-thumbnail/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '../../components/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const folder = 'thumbnails';
    const filename = `${Date.now()}-${file.name}`;
    const path = `${folder}/${filename}`;

    console.log("Uploading thumbnail to Supabase:", path);

    // Upload to Supabase storage
    const { error: uploadError } = await supabaseServer.storage
      .from('course_thumbnails')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      console.error('Supabase thumbnail upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabaseServer.storage
      .from('course_thumbnails')
      .getPublicUrl(path);

    console.log("Thumbnail uploaded successfully:", urlData.publicUrl);

    // ✅ FIX: Return as `url` instead of `publicUrl`
    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err: any) {
    console.error('upload-thumbnail error:', err);
    return NextResponse.json(
      { error: err.message || 'Upload error' },
      { status: 500 }
    );
  }
}
