// src/app/(frontend)/page.js
import Home from "@/components/frontend/home/Home";
import { getSeoConfig } from "@/components/lib/getSeoConfig";

export async function generateMetadata() {
  const seo = await getSeoConfig();

  return {
    title: seo.seoTitle,
    description: seo.seoDescription,
    keywords: seo.seoKeywords,
    alternates: { canonical: seo.siteUrl },
    openGraph: {
      type: "website",
      url: seo.siteUrl,
      title: seo.seoTitle,
      description: seo.seoDescription,
      images: [{ url: seo.logo, width: 1200, height: 630, alt: seo.siteName }],
    },
  };
}

export default function HomePage() {
  return <Home />;
}
