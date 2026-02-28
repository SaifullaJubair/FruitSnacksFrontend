// src/components/lib/getSeoConfig.js
import { SITE_URL } from "../utils/baseURL";
import { getServerSettingData } from "./getServerSettingData";

// ✅ Trailing slash fix
const joinUrl = (base, path) => {
  const cleanBase = base.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
};

// ✅ Fallback OG image — DB থেকে না আসলে এটা use হবে
const FALLBACK_IMAGE = "/public/logo.jpg";

export async function getSeoConfig() {
  const settingData = await getServerSettingData();
  const s = settingData?.data?.[0];

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
    joinUrl, // ✅ helper export করলাম
    seoTitle,
    seoDescription,
    seoKeywords,
    logo: s?.logo || FALLBACK_IMAGE, // ✅ fallback
    favicon: s?.favicon || "/favicon.ico",
    facebook: s?.facebook || "",
    instagram: s?.instagram || "",
  };
}
