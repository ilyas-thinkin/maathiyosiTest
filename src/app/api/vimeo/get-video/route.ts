// src/app/api/vimeo/get-video/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getVimeoVideo } from '@/app/components/lib/vimeoClient';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json(
        { error: 'videoId is required' },
        { status: 400 }
      );
    }

    console.log('Getting Vimeo video:', videoId);

    const video = await getVimeoVideo(videoId);

    return NextResponse.json({
      videoId: videoId,
      name: video.name,
      link: video.link,
      playerEmbedUrl: video.player_embed_url,
      duration: video.duration,
      status: video.status,
    });
  } catch (err: any) {
    console.error('Vimeo get video error:', err);
    return NextResponse.json(
      { error: err.message || 'Vimeo error' },
      { status: 500 }
    );
  }
}
