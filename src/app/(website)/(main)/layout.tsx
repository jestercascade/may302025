import { Footer } from "@/components/website/Footer";
import { NavbarWrapper } from "@/components/website/Navbar/NavbarWrapper";

export default function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavbarWrapper />
      <main className="pt-[65px] md:pt-[57px] min-h-[calc(100vh-328px)]">
        {children}
      </main>
      <Footer />
    </>
  );
}
