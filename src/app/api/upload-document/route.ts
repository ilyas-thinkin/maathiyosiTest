// src/app/api/upload-document/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '../../components/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Ensure unique file name to prevent conflicts
    const folder = 'documents';
    const filename = `${Date.now()}-${file.name}`;
    const path = `${folder}/${filename}`;

    console.log("Uploading document to Supabase:", path);

    // Upload file to Supabase
    const { error: uploadError } = await supabaseServer.storage
      .from('lesson_documents')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      console.error('Supabase document upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Generate public URL for the uploaded file
    const { data: urlData } = supabaseServer.storage
      .from('lesson_documents')
      .getPublicUrl(path);

    console.log("Document uploaded successfully:", urlData.publicUrl);

    // ✅ FIX: Return `url` instead of `publicUrl`
    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err: any) {
    console.error('upload-document error:', err);
    return NextResponse.json({ error: err.message || 'Upload error' }, { status: 500 });
  }
}
