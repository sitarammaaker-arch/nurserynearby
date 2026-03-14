import { MetadataRoute } from "next";
import { SITE } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/",
          "/admin/",
          "/admin-login",
          "/_next/",
          "/login",
          "/api/debug-cloudinary",
          "/api/test-whatsapp",
        ],
      },
      // Block AI scrapers from admin
      {
        userAgent: ["GPTBot", "ChatGPT-User", "Google-Extended", "CCBot"],
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap:    `${SITE.url}/sitemap.xml`,
    host:       SITE.url,
  };
}
