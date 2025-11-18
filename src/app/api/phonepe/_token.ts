// src/app/api/phonepe/_token.ts
import { NextRequest, NextResponse } from "next/server";

let cachedToken: { access_token: string; expires_at: number } | null = null;

async function fetchToken() {
  const url = process.env.PHONEPE_TOKEN_URL!;
  const clientId = process.env.PHONEPE_CLIENT_ID!;
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET!;

  const body = new URLSearchParams();
  body.append("client_id", clientId);
  body.append("client_secret", clientSecret);
  body.append("grant_type", "client_credentials");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await res.json();
  const expiresIn = Number(data.expires_in || 300);

  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + expiresIn * 1000 - 5000,
  };

  return cachedToken.access_token;
}

export async function GET(_: NextRequest) {
  try {
    if (cachedToken && cachedToken.expires_at > Date.now()) {
      return NextResponse.json({ access_token: cachedToken.access_token });
    }

    const token = await fetchToken();
    return NextResponse.json({ access_token: token });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
