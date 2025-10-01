import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const upload = await mux.video.uploads.create({
      cors_origin: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      new_asset_settings: { playback_policy: ['public'] },
    });

    return NextResponse.json({ uploadUrl: upload.url });
  } catch (err: any) {
    console.error('Mux upload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
