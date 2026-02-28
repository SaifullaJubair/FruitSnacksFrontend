// src/app/robots.js
import { getSeoConfig } from "@/components/lib/getSeoConfig";

export default async function robots() {
  const seo = await getSeoConfig();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/user-profile/",
          "/orders/",
          "/cart/",
          "/checkout/",
          "/verify/",
          "/change-password/",
          "/forget-password/",
          "/offer-orders/",
          "/compare/",
          "/wishlist/",
          // ✅ Search query params index হবে না
          "/*?search=*",
          "/*?page=*",
          "/*?sort=*",
        ],
      },
    ],
    sitemap: `${seo.siteUrl}/sitemap.xml`,
  };
}
