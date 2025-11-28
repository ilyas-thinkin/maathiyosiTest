// src/app/api/vimeo/create-folder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createVimeoFolder } from '@/app/components/lib/vimeoClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { folderName } = body;

    if (!folderName) {
      return NextResponse.json(
        { error: 'folderName is required' },
        { status: 400 }
      );
    }

    console.log('Creating Vimeo folder:', folderName);

    const folder = await createVimeoFolder(folderName);

    return NextResponse.json({
      folderId: folder.folder_id,
      folderUri: folder.uri,
      folderName: folder.name,
    });
  } catch (err: any) {
    console.error('Vimeo folder creation error:', err);
    return NextResponse.json(
      { error: err.message || 'Vimeo error' },
      { status: 500 }
    );
  }
}
