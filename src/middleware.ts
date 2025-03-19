import { DecodedIdToken } from "firebase-admin/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { appConfig } from "./config";

// Constants
const COOKIE_NAME = "cherlygood_session";
const ADMIN_ENTRY_KEY = appConfig.ADMIN.ENTRY_KEY || "";
if (!ADMIN_ENTRY_KEY) {
  throw new Error("ADMIN_ENTRY_KEY environment variable is required");
}

const ADMIN_EMAIL = appConfig.ADMIN.EMAIL || "";
if (!ADMIN_EMAIL) {
  throw new Error("ADMIN_EMAIL environment variable is required");
}

// Define protected routes (simplified, as "/admin/:path*" includes "/admin")
const PROTECTED_ROUTES = [
  "/admin/:path*", // All admin subpaths
  "/demo", // Example of another protected route
] as const;

// Custom error classes
class SessionVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SessionVerificationError";
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

// Helper functions
const isAdmin = (decodedClaims: DecodedIdToken): boolean => {
  return (
    decodedClaims.email === ADMIN_EMAIL &&
    decodedClaims.role === "admin" &&
    decodedClaims.grantedThrough === "admin_entry"
  );
};

const isProtectedRoute = (pathname: string): boolean => {
  return PROTECTED_ROUTES.some((route) => {
    if (route.includes(":path*")) {
      // Handle wildcard paths
      const basePath = route.split("/:path*")[0];
      return pathname.startsWith(basePath);
    }
    return pathname === route;
  });
};

const isValidAdminEntryKey = (pathname: string): boolean => {
  // Use escaped slashes for clarity
  const adminEntryPattern = /^\/auth\/admin\/(.*)$/;
  const match = pathname.match(adminEntryPattern);

  if (match) {
    const providedKey = match[1];
    return providedKey === ADMIN_ENTRY_KEY;
  }
  return false;
};

const signOutAndRedirect = async (
  request: NextRequest
): Promise<NextResponse> => {
  try {
    // Call the logout endpoint to clean up the session
    const response = await fetch(`${appConfig.BASE_URL}/api/auth/logout`, {
      method: "POST",
      signal: AbortSignal.timeout(5000), // 5-second timeout
    });

    if (!response.ok) {
      console.error("Failed to logout properly:", response.statusText);
    }
  } catch (error) {
    console.error("Error during logout:", error);
  }

  // Redirect to home page regardless of logout success
  return NextResponse.redirect(new URL("/", request.url));
};

const verifySessionWithAPI = async (
  sessionCookie: string
): Promise<DecodedIdToken> => {
  try {
    const response = await fetch(`${appConfig.BASE_URL}/api/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionCookie }),
      signal: AbortSignal.timeout(5000), // 5-second timeout
    });

    if (!response.ok) {
      throw new SessionVerificationError(
        `Invalid session: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  } catch (error: unknown) {
    if (
      error instanceof TypeError ||
      (error instanceof Error && error.name === "AbortError")
    ) {
      throw new NetworkError("Failed to verify session: Network error");
    }
    throw error;
  }
};

// Middleware function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for admin entry key route
  if (pathname.startsWith("/auth/admin/")) {
    if (!isValidAdminEntryKey(pathname)) {
      return signOutAndRedirect(request);
    }
    return NextResponse.next();
  }

  // If not a protected route, allow access
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  // Get session cookie
  const session = request.cookies.get(COOKIE_NAME);

  // If no session cookie exists, sign out and redirect
  if (!session) {
    return signOutAndRedirect(request);
  }

  try {
    const decodedClaims = await verifySessionWithAPI(session.value);

    // For admin routes, verify admin privileges
    if (pathname.startsWith("/admin")) {
      if (!isAdmin(decodedClaims)) {
        // Redirect unauthorized admin attempts after signing out
        return signOutAndRedirect(request);
      }
    }

    // Session is valid, allow request to proceed
    return NextResponse.next();
  } catch (error) {
    // For all error cases, sign out and redirect appropriately
    if (error instanceof NetworkError) {
      return NextResponse.redirect(new URL("/error", request.url));
    }
    return signOutAndRedirect(request);
  }
}

// Middleware configuration
export const config = {
  matcher: [
    "/admin/:path*", // All admin routes
    "/demo", // Example protected route
    "/auth/admin/:key*", // Admin entry key route
  ],
};
