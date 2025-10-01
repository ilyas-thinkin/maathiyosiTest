import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      adminId,
      courseId,
      title,
      description,
      video_uid,
      documentFileName,
      documentBase64
    } = body;

    let document_url: string | null = null;

    // ✅ Upload document to bucket if provided
    if (documentBase64 && documentFileName) {
      const buffer = Buffer.from(documentBase64, 'base64');
      const filePath = `${crypto.randomUUID()}-${documentFileName}`;

      const { error } = await supabase.storage
        .from('lesson_documents')
        .upload(filePath, buffer, {
          contentType: 'application/octet-stream',
          upsert: true,
        });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Get public URL
      const { publicUrl } = supabase.storage.from('lesson_documents').getPublicUrl(filePath).data;
      document_url = publicUrl;
    }

    // Insert lesson record
    const { data, error: insertError } = await supabase
      .from('course_lesson_cf')
      .insert({
        course_id: courseId,
        title,
        description,
        video_uid,
        document_name: documentFileName,
        document_url,
        created_by: adminId,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
