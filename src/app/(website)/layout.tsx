import { MobileNavbarOverlay } from "@/components/website/Navbar/MobileNavbarOverlay";
import { QuickviewOverlay } from "@/components/website/QuickviewOverlay";

export default function WebsiteOverlayLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <QuickviewOverlay />
      <MobileNavbarOverlay />
    </>
  );
}
