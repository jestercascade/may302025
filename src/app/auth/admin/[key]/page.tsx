"use client";

import {
  AdminGoogleSignInButton,
  AdminSignOutButton,
} from "@/components/auth/Admin";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export default function AdminEntryPage() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-gray-900">Admin Access</h2>
        <p className="mt-2 text-sm text-gray-600">
          {loading
            ? "Loading..."
            : user && isAdmin
            ? `Signed in as ${user.email}`
            : "Sign in with your authorized admin Google account"}
        </p>
        <div className="mt-8 flex justify-center">
          {loading ? null : user && isAdmin ? (
            <AdminSignOutButton />
          ) : (
            <AdminGoogleSignInButton />
          )}
        </div>
      </div>
    </div>
  );
}
