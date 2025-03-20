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

// Result type for session verification (replacing custom error classes)
type VerifySessionResult =
  | { success: true; decodedClaims: DecodedIdToken }
  | { success: false; error: string };

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
): Promise<VerifySessionResult> => {
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
      return {
        success: false,
        error: `Invalid session: ${response.status} ${response.statusText}`,
      };
    }

    let data;
    try {
      data = await response.json();
    } catch {
      return {
        success: false,
        error: "Invalid session: invalid JSON response",
      };
    }

    if (!data) {
      return {
        success: false,
        error: "Session verification returned null payload",
      };
    }

    return { success: true, decodedClaims: data as DecodedIdToken };
  } catch (error: unknown) {
    if (
      error instanceof TypeError ||
      (error instanceof Error && error.name === "AbortError")
    ) {
      return {
        success: false,
        error: "Failed to verify session: Network error",
      };
    }
    return {
      success: false,
      error: "An unexpected error occurred during session verification",
    };
  }
};

// Middleware function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for admin entry key route
  if (pathname.startsWith("/auth/admin/")) {
    if (!isValidAdminEntryKey(pathname)) {
      console.log("Invalid admin entry key provided");
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
    console.log("No session cookie found");
    return signOutAndRedirect(request);
  }

  const result = await verifySessionWithAPI(session.value);
  if (result.success) {
    const decodedClaims = result.decodedClaims;

    // For admin routes, verify admin privileges
    if (pathname.startsWith("/admin")) {
      if (!isAdmin(decodedClaims)) {
        console.log("Unauthorized admin access attempt");
        return signOutAndRedirect(request);
      }
    }

    // Session is valid, allow request to proceed
    return NextResponse.next();
  } else {
    console.log("Session verification failed:", result.error);
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
