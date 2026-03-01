// src/components/lib/buildPageMeta.js

import { getSeoConfig } from "./getSeoConfig";

export async function buildPageMeta(pageSeoConfig) {
  const seo = await getSeoConfig();
  const { title, description, path, noIndex = false } = pageSeoConfig;

  // ✅ Private pages — noindex, বাকি কিছু দরকার নেই
  if (noIndex) {
    return {
      title,
      robots: { index: false, follow: false },
    };
  }

  const url = seo.joinUrl(seo.siteUrl, path);

  return {
    title,
    description,
    alternates: { canonical: url },

    // ✅ পুরো openGraph — locale, siteName, images সব আছে
    // page level এ replace হলেও কিছু miss হবে না
    openGraph: {
      type: "website",
      locale: "bn_BD",
      siteName: seo.siteName,
      url,
      title,
      description,
      images: [
        {
          url: seo.logo,
          width: 1200,
          height: 630,
          alt: seo.siteName,
        },
      ],
    },

    // ✅ পুরো twitter card
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [seo.logo],
    },
  };
}
