// src/app/(frontend)/all-products/page.jsx
import AllProduct from "@/components/frontend/seeAllProduct/AllProduct";
import { getSeoConfig } from "@/components/lib/getSeoConfig";

export async function generateMetadata({ searchParams }) {
  const seo = await getSeoConfig();
  const search = searchParams?.search;

  if (search) {
    return {
      title: `"${search}" – Search Results`,
      description: `${seo.siteName} এ "${search}" এর search results।`,
      robots: { index: false, follow: true },
    };
  }

  return {
    title: `All Products – ${seo.siteName}`,
    description: `${seo.siteName} এর সব products। Genuine leather wallet, bag, belt। Best price Bangladesh।`,
    alternates: { canonical: `${seo.siteUrl}/all-products` },
    openGraph: {
      type: "website",
      url: `${seo.siteUrl}/all-products`,
      title: `All Products – ${seo.siteName}`,
      description: `${seo.siteName} এর সব products। Best price Bangladesh।`,
      images: [{ url: seo.logo, alt: seo.siteName }],
    },
  };
}

const AllProductPage = () => {
  return (
    <div>
      <AllProduct />
    </div>
  );
};

export default AllProductPage;
