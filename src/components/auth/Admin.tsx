"use client";

import { signInWithPopup } from "firebase/auth";
import { clientAuth, googleProvider } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { ShowAlertType } from "@/lib/sharedTypes";

export const AdminGoogleSignInButton = () => {
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { loading, user } = useAuth();
  const { showAlert } = useAlertStore();
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "";

  // Check admin status when user changes
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const tokenResult = await user.getIdTokenResult();
        setIsAdmin(tokenResult.claims.role === "admin");
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const signInWithGoogle = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);

    try {
      const entryPoint = currentPath;
      const result = await signInWithPopup(clientAuth, googleProvider);

      if (!result?.user) {
        showAlert({
          message: "Unable to sign in at this time",
          type: ShowAlertType.NEUTRAL,
        });
        return;
      }

      const idToken = await result.user.getIdToken();
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Entry-Point": entryPoint,
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.result === "ACCESS_DENIED") {
          showAlert({
            message: "Not authorized. Visit the homepage to keep shopping.",
            type: ShowAlertType.NEUTRAL,
          });
        } else if (data.result === "ADMIN_KEY_REQUIRED") {
          showAlert({
            message: "Admin access requires your secure key",
            type: ShowAlertType.NEUTRAL,
          });
        } else if (data.result === "MISSING_TOKEN") {
          showAlert({
            message: "Unable to complete sign-in",
            type: ShowAlertType.NEUTRAL,
          });
        } else if (data.result === "AUTH_FAILED") {
          showAlert({
            message: "Sign-in failed. Please try again.",
            type: ShowAlertType.NEUTRAL,
          });
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return;
      }

      if (data.result === "SUCCESS") {
        router.push("/admin");
      }
    } catch (error) {
      console.error("Error during admin sign-in:", error);
      await clientAuth.signOut();

      if (error instanceof Error) {
        if (error.message.includes("auth/popup-closed-by-user")) {
          return;
        }

        if (error.message.includes("auth/network-request-failed")) {
          showAlert({
            message: "Unable to connect. Please check your internet connection",
            type: ShowAlertType.NEUTRAL,
          });
          return;
        }
      }

      showAlert({
        message: "Sign-in failed. Please try again",
        type: ShowAlertType.NEUTRAL,
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <button
        disabled
        className="opacity-50 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow"
      >
        Loading...
      </button>
    );
  }

  return (
    <button
      onClick={signInWithGoogle}
      disabled={isSigningIn}
      className={`flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 ${
        isSigningIn ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
        />
      </svg>
      {isSigningIn
        ? "Signing in..."
        : user
        ? isAdmin
          ? "Signed in"
          : "Sign in as Admin"
        : "Sign in as Admin"}
    </button>
  );
};

export const AdminSignOutButton = () => {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    try {
      await clientAuth.signOut();
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <button
      onClick={signOut}
      disabled={isSigningOut}
      className={`rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 ${
        isSigningOut ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {isSigningOut ? "Signing out..." : "Sign Out"}
    </button>
  );
};
