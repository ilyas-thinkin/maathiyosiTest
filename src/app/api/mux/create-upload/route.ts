// src/app/api/mux/create-upload/route.ts
import { NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
  console.error('Missing MUX_TOKEN_ID or MUX_TOKEN_SECRET');
}

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST() {
  try {
    // create direct upload on Mux
    // cors_origin allows browser PUT from your domain; adjust as necessary
    const upload = await mux.video.uploads.create({
      new_asset_settings: { playback_policy: ['public'] },
      cors_origin: process.env.NEXT_PUBLIC_SITE_URL ?? '*',
    });

    // upload.url is the direct PUT URL
    return NextResponse.json({
      uploadUrl: upload.url,
      uploadId: upload.id,
      assetId: null,
    });
  } catch (err: any) {
    console.error('Mux upload creation error:', err);
    return NextResponse.json({ error: err.message || 'Mux error' }, { status: 500 });
  }
}
