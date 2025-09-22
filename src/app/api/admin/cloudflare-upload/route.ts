import { NextRequest, NextResponse } from "next/server";

// ✅ These environment variables must be set
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_BUCKET = process.env.CLOUDFLARE_BUCKET;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_BUCKET || !CLOUDFLARE_API_TOKEN) {
  throw new Error("Cloudflare environment variables are missing!");
}

export async function POST(req: NextRequest) {
  try {
    const { fileName } = await req.json();

    if (!fileName) {
      return NextResponse.json({ error: "fileName is required" }, { status: 400 });
    }

    // Generate a unique key for R2 object
    const uid = `${Date.now()}-${fileName}`;

    // Generate signed URL for direct PUT upload
    const uploadURL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${CLOUDFLARE_BUCKET}/objects/${uid}`;

    // Return uploadURL and uid to client
    return NextResponse.json({ uploadURL, uid });
  } catch (err: any) {
    console.error("Cloudflare upload error:", err);
    return NextResponse.json({ error: "Server error generating Cloudflare upload URL" }, { status: 500 });
  }
}
