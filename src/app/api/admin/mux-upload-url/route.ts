import { NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

const { Video } = new (Mux as any)({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function GET() {
  try {
    const upload = await Video.Uploads.create({
      new_asset_settings: { playback_policy: ['public'] },
    });

    return NextResponse.json({ uploadUrl: upload.url, assetId: upload.asset.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
