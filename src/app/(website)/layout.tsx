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
    </>
  );
}
