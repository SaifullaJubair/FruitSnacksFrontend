// src/app/sitemap.js
import { getSeoConfig } from "@/components/lib/getSeoConfig";
import { BASE_URL } from "@/components/utils/baseURL";

export default async function sitemap() {
  const seo = await getSeoConfig();
  const SITE_URL = seo.siteUrl;

  const staticPages = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/all-products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about-us`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/return-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms-condition`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  let productPages = [];
  try {
    const res = await fetch(
      `${BASE_URL}/product?page=1&limit=500&product_status=active`,
      {
        next: { revalidate: 3600 },
      },
    );
    const data = await res.json();
    productPages = (data?.data || []).map((p) => ({
      url: `${SITE_URL}/products/${p.product_slug}`,
      lastModified: new Date(p.updatedAt || p.createdAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {}

  let categoryPages = [];
  try {
    const res = await fetch(`${BASE_URL}/category/category_sub_child`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    categoryPages = (data?.data || []).map((item) => ({
      url: `${SITE_URL}/category/${item.category?.category_slug}`,
      lastModified: new Date(
        item.category?.updatedAt || item.category?.createdAt,
      ),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {}

  return [...staticPages, ...productPages, ...categoryPages];
}
