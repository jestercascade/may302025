import { NavigationProvider } from "@/components/shared/NavigationLoadingIndicator";
import ShowAlert from "@/components/shared/ShowAlert";
import { AuthProvider } from "@/contexts/AuthContext";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { appConfig } from "@/config";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.BASE_URL),
  title: {
    default: appConfig.SEO.TITLE,
    template: `%s - ${appConfig.APP_NAME}`,
  },
  description: appConfig.SEO.DESCRIPTION,
  robots: {
    index: appConfig.SEO.ROBOTS_PUBLIC.includes("index"),
    follow: appConfig.SEO.ROBOTS_PUBLIC.includes("follow"),
    googleBot: {
      index: appConfig.SEO.ROBOTS_PUBLIC.includes("index"),
      follow: appConfig.SEO.ROBOTS_PUBLIC.includes("follow"),
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: appConfig.SEO.TITLE,
    description: appConfig.SEO.DESCRIPTION,
    images: [
      {
        url: appConfig.SEO.IMAGE,
        width: 1200,
        height: 630,
        alt: `${appConfig.APP_NAME} Open Graph Image`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: appConfig.SEO.TWITTER_HANDLE,
    title: appConfig.SEO.TITLE,
    description: appConfig.SEO.DESCRIPTION,
    images: [appConfig.SEO.IMAGE],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: appConfig.STRUCTURED_DATA.name,
    url: appConfig.BASE_URL,
    logo: appConfig.STRUCTURED_DATA.logo,
    sameAs: appConfig.STRUCTURED_DATA.socialLinks,
  };

  return (
    <html lang="en">
      <head>
        <link rel="canonical" href={appConfig.SEO.CANONICAL} />
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
