import { MobileNavbarOverlay } from "@/components/admin/Navbar/MobileNavbarOverlay";
import { ProtectedRouteGuard } from "@/components/auth/ProtectedRouteGuard";
import Navbar from "@/components/admin/Navbar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRouteGuard>
      <Navbar />
      <main className="pt-24 pb-20 min-h-screen bg-neutral-50">
        <div className="w-full max-w-screen-lg mx-auto">{children}</div>
      </main>
      <footer className="w-full py-5 border-t bg-neutral-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-center text-xs text-gray-500">
            <p>© {new Date().getFullYear()} Cherlygood. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <MobileNavbarOverlay />
    </ProtectedRouteGuard>
  );
}
