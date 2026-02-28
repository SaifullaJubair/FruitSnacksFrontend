import { getSeoConfig } from "./getSeoConfig";

export async function buildPageMeta(pageSeoConfig) {
  const seo = await getSeoConfig();
  const { title, description, path, noIndex = false } = pageSeoConfig;

  const url = seo.joinUrl(seo.siteUrl, path);

  // ✅ Private pages — noindex
  if (noIndex) {
    return {
      title,
      robots: { index: false, follow: false },
    };
  }

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      url,
      title,
      description,
    },
  };
}
