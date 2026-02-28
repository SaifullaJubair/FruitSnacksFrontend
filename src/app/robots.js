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
          "/order-success/",
          "/cart/",
          "/checkout/",
          "/verify/",
          "/change-password/",
          "/forget-password/",
          "/sign-in/",
          "/sign-up/",
          "/offer/",
          "/shop/",
          "/offer-orders/",
          "/compare/",
          "/wishlist/",

          // ✅ কুয়েরি প্যারামিটার
          "/*?search=*",
          "/*?page=*",
          "/*?sort=*",
          "/*?filter=*",
        ],
      },
    ],
    sitemap: `${seo.siteUrl}/sitemap.xml`,
  };
}
