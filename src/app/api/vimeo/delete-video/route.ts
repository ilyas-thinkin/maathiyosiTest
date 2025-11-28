// src/app/api/vimeo/delete-video/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { deleteVimeoVideo } from '@/app/components/lib/vimeoClient';

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json(
        { error: 'videoId is required' },
        { status: 400 }
      );
    }

    console.log('Deleting Vimeo video:', videoId);

    await deleteVimeoVideo(videoId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Vimeo delete video error:', err);
    return NextResponse.json(
      { error: err.message || 'Vimeo error' },
      { status: 500 }
    );
  }
}
