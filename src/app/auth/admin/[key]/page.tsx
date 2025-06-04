"use client";

import { AdminGoogleSignInButton, AdminSignOutButton } from "@/components/auth/Admin";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import { HiLockClosed } from "react-icons/hi";

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="pt-16 pb-8">
        <div className="flex justify-center">
          <Link href="/" className="block">
            <Image src="/cherlygood/logo.svg" alt="Cherlygood" width={220} height={27} priority />
          </Link>
        </div>
      </div>
      <div className="flex-1 flex items-start justify-center px-8">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-7 py-10">
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center shadow-sm">
                <HiLockClosed className="w-6 h-6 text-gray-500" />
              </div>
            </div>
            <h1 className="text-2xl font-medium text-gray-900 text-center mb-2">Admin Access</h1>
            {!loading && (!user || !isAdmin) && (
              <p className="text-sm text-gray-600 text-center mb-8 leading-relaxed">
                Sign in with your authorized admin Google account to continue
              </p>
            )}
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-5 h-5 border-2 border-gray-200 border-t-[#404040] rounded-full animate-spin" />
                <span className="ml-3 text-sm text-gray">Authenticating...</span>
              </div>
            ) : user && isAdmin ? (
              <div className="text-center pb-4 my-6">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="ml-2 text-sm font-medium">Authenticated</span>
                </div>
                <p className="text-sm text-gray">{user.email}</p>
              </div>
            ) : null}
            <div className="flex justify-center">
              {loading ? null : user && isAdmin ? <AdminSignOutButton /> : <AdminGoogleSignInButton />}
            </div>
          </div>
          <p className="text-center text-xs text-gray mt-5">Secure administrative access</p>
        </div>
      </div>
    </div>
  );
}
