// src/app/api/vimeo/update-privacy/route.ts
import { NextRequest, NextResponse } from 'next/server';

const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN!;
const VIMEO_API_BASE_URL = process.env.VIMEO_API_BASE_URL || 'https://api.vimeo.com';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { videoId } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: 'videoId is required' },
        { status: 400 }
      );
    }

    console.log('Updating Vimeo video privacy settings for:', videoId);

    // Update video privacy and embed settings
    const response = await fetch(`${VIMEO_API_BASE_URL}/videos/${videoId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${VIMEO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.vimeo.*+json;version=3.4'
      },
      body: JSON.stringify({
        privacy: {
          view: 'disable',
          embed: 'public',
          download: false,
          add: false,
          comments: 'nobody'
        },
        embed: {
          title: {
            name: 'hide',
            owner: 'hide',
            portrait: 'hide'
          },
          buttons: {
            like: false,
            watchlater: false,
            share: false,
            embed: false,
            hd: false,
            fullscreen: true,
            scaling: true
          },
          logos: {
            vimeo: false
          },
          color: 'de5252'
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Vimeo update error:', error);
      return NextResponse.json(
        { error: `Failed to update Vimeo video: ${response.status} ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Video privacy settings updated',
      data
    });
  } catch (err: any) {
    console.error('Vimeo privacy update error:', err);
    return NextResponse.json(
      { error: err.message || 'Vimeo error' },
      { status: 500 }
    );
  }
}
