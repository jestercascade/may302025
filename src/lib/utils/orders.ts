import { appConfig } from "@/config";

const PAYPAL_CLIENT_ID = appConfig.PAYPAL.CLIENT_ID;
const PAYPAL_CLIENT_SECRET = appConfig.PAYPAL.CLIENT_SECRET;

export async function generateAccessToken() {
  console.log("PayPal CLIENT_ID:", PAYPAL_CLIENT_ID);
  console.log("PayPal CLIENT_SECRET:", PAYPAL_CLIENT_SECRET);
  console.log("PayPal API_BASE:", appConfig.PAYPAL.API_BASE);

  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("Missing PayPal credentials");
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

  const response = await fetch(`${appConfig.PAYPAL.API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get PayPal access token");
  }

  const data = await response.json();
  return data.access_token;
}
