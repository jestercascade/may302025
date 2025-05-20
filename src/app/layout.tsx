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
    template: `%s | ${appConfig.APP_NAME}`,
  },
  description: appConfig.SEO.DESCRIPTION,
  ...(process.env.APP_ENV !== "production" && {
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
  }),
  openGraph: {
    title: {
      default: appConfig.SEO.TITLE,
      template: `%s | ${appConfig.APP_NAME}`,
    },
    description: appConfig.SEO.DESCRIPTION,
    images: [
      {
        url: appConfig.SEO.IMAGE,
        width: 1200,
        height: 630,
        alt: `${appConfig.APP_NAME} Open Graph Image`,
      },
    ],
    siteName: appConfig.APP_NAME,
  },
  twitter: {
    card: "summary_large_image",
    creator: appConfig.SEO.TWITTER_HANDLE,
    images: appConfig.SEO.IMAGE,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
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
