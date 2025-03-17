import { NavigationProvider } from "@/components/shared/NavigationLoadingIndicator";
import ShowAlert from "@/components/shared/ShowAlert";
import { AuthProvider } from "@/contexts/AuthContext";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Cherlygood - Literally Stop, Stare, Then Buy It.",
    template: "%s - Cherlygood",
  },
  description:
    "Make your style the one everyone's screenshotting—clothes, aesthetic finds, and zero regrets. Shop now!",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Cherlygood",
    url: "https://cherlygood.com",
    logo: "https://cherlygood.com/logo.png",
    sameAs: [
      "https://www.facebook.com/cherlygood",
      "https://www.instagram.com/cherlygood",
      "https://x.com/cherlygood",
    ],
  };

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <link rel="canonical" href="https://cherlygood.com/" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
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
