// src/components/lib/getSeoConfig.js
// Main Engine - SEO Configuration
import { SITE_URL } from "../utils/baseURL";
import { getServerSettingData } from "./getServerSettingData";

// ✅ Trailing slash fix
const joinUrl = (base, path) => {
  const cleanBase = base.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
};

// ✅ Fallback OG image — DB থেকে না আসলে এটা use হবে
const FALLBACK_IMAGE = "/logo.jpg"; // public folder a এটা আছে site logo

export async function getSeoConfig() {
  let s = null;
  try {
    const settingData = await getServerSettingData();
    s = settingData?.data?.[0];
  } catch (error) {
    console.error("Server Setting Data Fetch Error:", error);
  }

  const siteName = s?.title || "FruitSnacks";
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
    youtube: s?.you_tube || "",
    whatsapp: s?.watsapp || "",
    tiktok: s?.tik_tok || "",
    twitter: s?.twitter || "",

    // ── Analytics — enabled toggles DB থেকে, IDs .env থেকে ───
    // ✅ enabled check DB থেকে
    metaPixelEnabled: !!s?.meta_pixel_enabled,
    tiktokPixelEnabled: !!s?.tiktok_pixel_enabled,
    gtmEnabled: !!s?.gtm_enabled,
    ga4Enabled: !!s?.ga4_enabled,
    clarityEnabled: !!s?.clarity_enabled,

    // ✅ IDs .env থেকে — DB তে নেই, API response এ আসবে না
    metaPixelId: s?.meta_pixel_enabled
      ? process.env.META_PIXEL_ID || null
      : null,
    tiktokPixelId: s?.tiktok_pixel_enabled
      ? process.env.TIKTOK_PIXEL_ID || null
      : null,
    gtmId: s?.gtm_enabled ? process.env.GTM_ID || null : null,
    ga4Id: s?.ga4_enabled ? process.env.GA4_ID || null : null,
    clarityId: s?.clarity_enabled ? process.env.CLARITY_ID || null : null,
  };
}
