"use client";

import { signInWithPopup } from "firebase/auth";
import { clientAuth, googleProvider } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAlertStore } from "@/zustand/shared/alertStore";
import { ShowAlertType } from "@/lib/sharedTypes";
import { SiGoogle } from "react-icons/si";

export const AdminGoogleSignInButton = () => {
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { loading, user } = useAuth();
  const { showAlert } = useAlertStore();
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

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
      className={`min-w-[192px] w-max flex items-center justify-center gap-3 rounded-full px-5 py-2.5 text-white text-[15px] font-medium tracking-[-0.005em] transition-all duration-300 ease-out bg-[#404040] hover:bg-[#525252] hover:shadow-lg hover:shadow-black/25 active:scale-[0.98] active:duration-100 ${
        isSigningIn ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      <SiGoogle className="h-4 w-4" />
      {isSigningIn ? "Signing in..." : user ? (isAdmin ? "Signed in" : "Sign-in as Admin") : "Sign-in as Admin"}
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
      className={`min-w-[192px] w-max flex items-center justify-center gap-3 rounded-full px-6 py-2.5 text-[15px] font-medium tracking-[-0.005em] transition-all duration-300 ease-out bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 hover:shadow-md hover:shadow-black/10 active:scale-[0.98] active:duration-100 ${
        isSigningOut ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      {isSigningOut ? "Signing out..." : "Sign Out"}
    </button>
  );
};
