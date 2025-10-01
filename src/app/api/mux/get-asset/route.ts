import { NextResponse } from "next/server";
import Mux from "@mux/mux-node";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { uploadId } = await req.json();

    if (!uploadId) {
      return NextResponse.json({ error: "Missing uploadId" }, { status: 400 });
    }

    const upload = await mux.video.uploads.retrieve(uploadId);
    if (!upload || !upload.asset_id) {
      return NextResponse.json({ error: "Upload not ready" }, { status: 404 });
    }

    const asset = await mux.video.assets.retrieve(upload.asset_id);

    if (!asset.playback_ids || asset.playback_ids.length === 0) {
      return NextResponse.json({ error: "Playback ID not ready" }, { status: 404 });
    }

    const playbackId = asset.playback_ids[0].id;
    const playbackUrl = `https://stream.mux.com/${playbackId}.m3u8`;

    return NextResponse.json({
      assetId: asset.id,
      playbackUrl,
    });
  } catch (error: any) {
    console.error("Mux get asset error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
