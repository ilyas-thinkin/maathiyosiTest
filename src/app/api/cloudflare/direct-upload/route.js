import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'GET route working correctly!' });
}

export async function POST() {
  const ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
  const API_TOKEN = process.env.CF_API_TOKEN;

  if (!ACCOUNT_ID || !API_TOKEN) {
    return NextResponse.json(
      { error: 'Missing Cloudflare credentials' },
      { status: 500 }
    );
  }

  try {
    // Request Cloudflare to create a direct upload URL
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxDurationSeconds: 7200, // 2 hours max video
          creator: 'admin-upload',   // optional
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.errors || 'Failed to create direct upload URL' },
        { status: response.status }
      );
    }

    // Return the direct upload URL and the UID
    return NextResponse.json({
      uploadURL: data.result.uploadURL,
      uid: data.result.uid,
    });
  } catch (error) {
    console.error('Cloudflare direct upload error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
