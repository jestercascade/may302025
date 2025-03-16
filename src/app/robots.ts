import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: [
          "/cart",
          "/payment-successful",
          "/newsletter-unsubscribe",
          "/admin",
          "/auth/admin/",
          "/api",
        ],
        allow: ["/"],
      },
    ],
    sitemap: "https://cherlygood.com/sitemap.xml",
  };
}
