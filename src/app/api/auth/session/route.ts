import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

const COOKIE_NAME = "cherlygood_session";
const ADMIN_ENTRY_KEY = process.env.ADMIN_ENTRY_KEY || "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entryPoint = request.headers.get("X-Entry-Point") || "";

    if (!body.idToken) {
      return NextResponse.json({ result: "MISSING_TOKEN" }, { status: 400 });
    }

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(body.idToken);
    const isAdminEmail = decodedToken.email === ADMIN_EMAIL;
    const isAdminEntryPoint = entryPoint.includes(
      `/auth/admin/${ADMIN_ENTRY_KEY}`
    );

    // INITIAL AUTHENTICATION - Only require entry point during first login
    if (isAdminEmail && isAdminEntryPoint) {
      await adminAuth.setCustomUserClaims(decodedToken.uid, {
        role: "admin",
        grantedAt: Date.now(),
        grantedThrough: "admin_entry",
      });
    } else if (isAdminEmail) {
      // For admin email but NOT through entry point:
      // Check if they ALREADY have admin role in their token
      if (decodedToken.role === "admin") {
        // They're already an admin, so continue
      } else {
        // They're trying to sign in as admin without using the proper entry point
        return NextResponse.json(
          { result: "ADMIN_KEY_REQUIRED" },
          { status: 403 }
        );
      }
    } else {
      // Regular user - set customer claims
      await adminAuth.setCustomUserClaims(decodedToken.uid, {
        role: "customer",
        grantedAt: Date.now(),
      });
    }

    // Create session
    const twoWeeksInMilliseconds = 60 * 60 * 24 * 14 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(body.idToken, {
      expiresIn: twoWeeksInMilliseconds,
    });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, sessionCookie, {
      maxAge: twoWeeksInMilliseconds,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ result: "SUCCESS" }, { status: 200 });
  } catch {
    return NextResponse.json({ result: "AUTH_FAILED" }, { status: 401 });
  }
}
