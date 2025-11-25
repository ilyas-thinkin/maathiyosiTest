import axios from "axios";
import qs from "qs";

export async function getPhonePeToken(): Promise<string> {
  try {
    const body = qs.stringify({
      client_id: process.env.PHONEPE_CLIENT_ID!,
      client_secret: process.env.PHONEPE_CLIENT_SECRET!,
      client_version: process.env.PHONEPE_CLIENT_VERSION!,
      grant_type: "client_credentials",
    });

    const response = await axios.post(
      process.env.PHONEPE_TOKEN_URL!,
      body,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    return response.data.data.accessToken;
  } catch (error: any) {
    console.error("PhonePe Token Error:", error.response?.data || error);
    throw new Error("Failed to get PhonePe OAuth Token");
  }
}
