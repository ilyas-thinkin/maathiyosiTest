import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ⚠️ Use your Supabase URL and SERVICE_ROLE_KEY from .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { fileName, fileBuffer } = await req.json();

    if (!fileName || !fileBuffer) {
      return NextResponse.json({ error: 'fileName and fileBuffer are required' }, { status: 400 });
    }

    const buffer = Buffer.from(fileBuffer, 'base64');

    const { data, error } = await supabaseAdmin.storage
      .from('lesson_documents')
      .upload(fileName, buffer, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Generate public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('lesson_documents')
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (err: any) {
    console.error('Upload-document API error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
