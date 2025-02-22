"use client";

import { signInWithPopup } from "firebase/auth";
import { clientAuth, googleProvider } from "@/lib/firebase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAlertStore } from "@/zustand/website/alertStore";
import { AlertMessageType } from "@/lib/sharedTypes";

export const WebsiteGoogleSignInButton = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { loading, user } = useAuth();
  const { showAlert } = useAlertStore();

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
      const result = await signInWithPopup(clientAuth, googleProvider);
      if (!result?.user) {
        showAlert({
          message: "Unable to sign in at this time",
          type: AlertMessageType.NEUTRAL,
        });
        return;
      }

      const idToken = await result.user.getIdToken();
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Entry-Point": window.location.pathname,
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.result === "ADMIN_KEY_REQUIRED") {
          showAlert({
            message: "Admin access requires your secure key",
            type: AlertMessageType.NEUTRAL,
          });
          return;
        }
        if (data.result === "MISSING_TOKEN") {
          showAlert({
            message: "Unable to complete sign-in",
            type: AlertMessageType.NEUTRAL,
          });
          return;
        }
        if (data.result === "AUTH_FAILED") {
          showAlert({
            message: "Sign-in failed. Please try again",
            type: AlertMessageType.NEUTRAL,
          });
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (data.result === "SUCCESS") {
        router.push(callbackUrl || "/");
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      await clientAuth.signOut();

      if (error instanceof Error) {
        if (error.message.includes("auth/popup-closed-by-user")) {
          return;
        }
        if (error.message.includes("auth/network-request-failed")) {
          showAlert({
            message: "Unable to connect. Please check your internet connection",
            type: AlertMessageType.NEUTRAL,
          });
          return;
        }
      }

      showAlert({
        message: "Sign-in failed. Please try again",
        type: AlertMessageType.NEUTRAL,
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <button
        disabled
        className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow opacity-50"
      >
        Loading...
      </button>
    );
  }

  return (
    <button
      onClick={signInWithGoogle}
      disabled={isSigningIn}
      className={`flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow hover:bg-gray-50 ${
        isSigningIn ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {isSigningIn
        ? "Signing in..."
        : user
        ? isAdmin
          ? "Sign in with Google"
          : "Signed in"
        : "Sign in with Google"}
    </button>
  );
};

export const WebsiteSignOutButton = () => {
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
