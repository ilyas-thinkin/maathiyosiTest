// app/api/phonepe/auth/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const tokenUrl = process.env.PHONEPE_TOKEN_URL!;
    const clientId = process.env.PHONEPE_CLIENT_ID!;
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET!;

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    });

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to get auth token", details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({
      access_token: data.access_token,
      expires_in: data.expires_in,
    });
  } catch (error: any) {
    console.error("PhonePe Auth Error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}