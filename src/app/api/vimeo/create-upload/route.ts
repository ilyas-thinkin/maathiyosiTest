// src/app/api/vimeo/create-upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createVimeoUpload } from '@/app/components/lib/vimeoClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileName, fileSize, folderId } = body;

    if (!fileName || !fileSize) {
      return NextResponse.json(
        { error: 'fileName and fileSize are required' },
        { status: 400 }
      );
    }

    console.log('Creating Vimeo upload for:', fileName, 'Size:', fileSize, 'Folder:', folderId);

    const uploadData = await createVimeoUpload(fileName, fileSize, folderId);

    return NextResponse.json({
      uploadUrl: uploadData.upload.upload_link,
      videoUri: uploadData.uri,
      playerEmbedUrl: uploadData.player_embed_url,
      link: uploadData.link,
    });
  } catch (err: any) {
    console.error('Vimeo upload creation error:', err);
    return NextResponse.json(
      { error: err.message || 'Vimeo error' },
      { status: 500 }
    );
  }
}
