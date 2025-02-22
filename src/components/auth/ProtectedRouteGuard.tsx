"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/ui/Spinners/Default";

export function ProtectedRouteGuard({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Prevent back navigation to admin routes after logout
    const handlePopState = () => {
      if (!user && window.location.pathname.startsWith("/auth/admin/")) {
        window.history.replaceState(null, "", "/");
        router.replace("/");
      }
    };

    // Add popstate listener to handle back button
    window.addEventListener("popstate", handlePopState);

    // Only redirect if we're not loading and there's no user
    if (!loading && !user) {
      // Clear any admin routes from browser history
      if (window.location.pathname.startsWith("/auth/admin/")) {
        // Clear entire history and replace with homepage
        window.history.pushState(null, "", "/");
        window.history.pushState(null, "", "/");
        window.history.go(-1);
      } else {
        // Normal redirect for non-admin routes
        router.prefetch("/");
        queueMicrotask(() => {
          window.history.replaceState(null, "", "/");
          router.replace("/");
        });
      }
      return;
    }

    // Handle admin check
    if (!loading && user && requireAdmin) {
      user.getIdTokenResult().then((tokenResult) => {
        if (tokenResult.claims.role !== "admin") {
          router.prefetch("/");
          queueMicrotask(() => {
            window.history.replaceState(null, "", "/");
            router.replace("/");
          });
        }
      });
    }

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [user, loading, router, requireAdmin]);

  // Show loading state for any waiting condition
  if (loading || !user || (requireAdmin && user && !user.getIdTokenResult())) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner color="gray" size={28} />
      </div>
    );
  }

  return <>{children}</>;
}

export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  requireAdmin = false
) {
  return function WrappedComponent(props: P) {
    return (
      <ProtectedRouteGuard requireAdmin={requireAdmin}>
        <Component {...props} />
      </ProtectedRouteGuard>
    );
  };
}
