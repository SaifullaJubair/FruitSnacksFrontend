// src/components/lib/getSeoConfig.js
// ✅ Reusable SEO config — সব page এ use করো

import { SITE_URL } from "../utils/baseURL";
import { getServerSettingData } from "./getServerSettingData";

export async function getSeoConfig() {
  const settingData = await getServerSettingData();
  const s = settingData?.data?.[0];

  // Admin setting থেকে নাও, না থাকলে fallback
  const siteName = s?.title || "Artisan Leather";
  const seoTitle =
    s?.seo_title || `${siteName} – Premium Genuine Leather Products Bangladesh`;
  const seoDescription =
    s?.seo_description ||
    `${siteName} – Bangladesh এর সেরা genuine leather wallet, bag ও belt। High quality, affordable price। Cash on delivery সারাদেশে।`;
  const seoKeywords = s?.seo_keywords
    ? s.seo_keywords.split(",").map((k) => k.trim())
    : [
        "leather wallet",
        "genuine leather",
        "leather bag",
        "leather belt",
        "bangladesh",
      ];

  return {
    siteName,
    siteUrl: SITE_URL,
    seoTitle,
    seoDescription,
    seoKeywords,
    logo: s?.logo || "",
    favicon: s?.favicon || "/favicon.ico",
    // Social
    facebook: s?.facebook || "",
    instagram: s?.instagram || "",
  };
}
