import { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const { sessionCookie } = await request.json();

    if (!sessionCookie) {
      return new Response("Session cookie is required", { status: 400 });
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return new Response(JSON.stringify(decodedClaims), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // console.error("Session verification failed:", error);
    return new Response("Invalid session", { status: 401 });
  }
}
