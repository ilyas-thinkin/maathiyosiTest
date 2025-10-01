import { NextRequest, NextResponse } from "next/server";
import Mux from "@mux/mux-node";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { playbackId } = await req.json();

    if (!playbackId) {
      return NextResponse.json(
        { error: "Playback ID is required" },
        { status: 400 }
      );
    }

    console.log("Attempting to delete asset with playback ID:", playbackId);

    // List all assets and iterate through the paginated response
    const assetsPage = await mux.video.assets.list({
      limit: 100,
    });

    let foundAsset = null;

    // Iterate through the paginated response
    for await (const asset of assetsPage) {
      const hasMatchingPlaybackId = asset.playback_ids?.some(
        (p: any) => p.id === playbackId
      );
      
      if (hasMatchingPlaybackId) {
        foundAsset = asset;
        break;
      }
    }

    if (!foundAsset) {
      console.log("Asset not found for playback ID:", playbackId);
      return NextResponse.json(
        { error: "Asset not found for the given playback ID" },
        { status: 404 }
      );
    }

    console.log("Found asset ID:", foundAsset.id);

    // Delete the asset
    await mux.video.assets.delete(foundAsset.id);

    console.log("Successfully deleted asset:", foundAsset.id);

    return NextResponse.json({
      success: true,
      message: "Asset deleted successfully",
      assetId: foundAsset.id,
    });
  } catch (error: any) {
    console.error("Error deleting Mux asset:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete asset" },
      { status: 500 }
    );
  }
}