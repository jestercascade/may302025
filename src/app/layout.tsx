import { NavigationProvider } from "@/components/shared/NavigationLoadingIndicator";
import ShowAlert from "@/components/shared/ShowAlert";
import { AuthProvider } from "@/contexts/AuthContext";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Cherlygood – Literally Stop, Stare, Then Buy It.",
    template: "%s – Cherlygood",
  },
  description:
    "Make your style the one everyone's screenshotting—clothes, aesthetic finds, and zero regrets. Shop now!",
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} body-scrollbar`}>
        <NavigationProvider>
          <AuthProvider>
            {children}
            <ShowAlert />
          </AuthProvider>
        </NavigationProvider>
      </body>
    </html>
  );
}
