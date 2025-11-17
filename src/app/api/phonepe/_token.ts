import qs from "querystring";

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getPhonePeToken() {
  const now = Date.now();

  // return cached token if valid
  if (cachedToken && cachedToken.expiresAt > now + 5000) {
    return cachedToken.token;
  }

  const tokenUrl = process.env.PHONEPE_TOKEN_URL!;
  const clientId = process.env.PHONEPE_CLIENT_ID!;
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET!;

  const body = qs.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
    client_version: 1
  });

  const resp = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  const data = await resp.json();

  if (!resp.ok) {
    throw new Error("Token error: " + JSON.stringify(data));
  }

  const token = data?.access_token ?? data?.accessToken;

  cachedToken = {
    token,
    expiresAt: Date.now() + (data?.expires_in ?? 3600) * 1000
  };

  return token;
}
