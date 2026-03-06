// src/app/(frontend)/products/[slug]/page.js
import { BASE_URL } from "@/components/utils/baseURL";
import SingleProduct from "@/components/frontend/singeProduct/SingleProduct";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSeoConfig } from "@/components/lib/getSeoConfig";
import { redirect } from "next/navigation";

export async function generateMetadata({ params }) {
  const { slug } = params;
  const seo = await getSeoConfig();

  const res = await fetch(`${BASE_URL}/product/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return {
      title: `Product Not Found | ${seo.siteName}`,
      robots: { index: false },
    };
  }

  const productData = await res.json();

  // ✅ পুরনো slug — redirect হবে, metadata দরকার নেই
  if (productData?.redirect_slug) {
    return { robots: { index: false } };
  }

  const product = productData?.data;
  if (!product) return { title: `Product Not Found | ${seo.siteName}` };

  const price = product?.product_discount_price || product?.product_price;
  const description =
    product?.meta_description ||
    `${product?.product_name} – ${seo.siteName} এ পাচ্ছেন মাত্র ৳${price}। Genuine leather, premium quality। Cash on delivery সারাদেশে।`;
  const productImage = product?.main_image || seo.logo;

  return {
    title: product?.product_name,
    description,
    alternates: {
      canonical: seo.joinUrl(seo.siteUrl, `products/${slug}`),
    },
    openGraph: {
      type: "article",
      locale: "bn_BD",
      siteName: seo.siteName,
      url: seo.joinUrl(seo.siteUrl, `products/${slug}`),
      title: product?.product_name,
      description,
      images: [
        {
          url: productImage,
          width: 800,
          height: 800,
          alt: product?.product_name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product?.product_name,
      description,
      images: [productImage],
    },
  };
}

const ProductDetailsPage = async ({ params }) => {
  const { slug } = params;

  const [seo, productRes] = await Promise.all([
    getSeoConfig(),
    fetch(`${BASE_URL}/product/${slug}`, { cache: "no-store" }),
  ]);

  const data = await productRes.json();

  // ✅ পুরনো slug — নতুন slug এ redirect
  if (data?.redirect_slug) {
    redirect(`/products/${data.redirect_slug}`);
  }

  const product = data?.data;

  if (!product) {
    return (
      <div className="text-center max-w-md mx-auto mt-2 bg-white p-6 shadow-lg">
        <img
          src="/assets/images/empty/Empty-cuate.png"
          alt="Product not found"
          className="mx-auto mb-2 w-80 sm:w-96"
        />
        <h3 className="font-semibold text-gray-800 mb-2">Product Not Found!</h3>
        <p className="text-gray-600 mb-6">
          We couldn't find the product you're looking for. It might have been
          removed or the URL might be incorrect.
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Link href="/">
            <Button className="w-full">Go Home</Button>
          </Link>
          <Link href="/all-products">
            <Button variant="secondary" className="w-full">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const price = product?.product_discount_price || product?.product_price;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product?.product_name,
    image: product?.main_image,
    description: product?.meta_description || product?.product_name,
    brand: { "@type": "Brand", name: seo.siteName },
    offers: {
      "@type": "Offer",
      url: seo.joinUrl(seo.siteUrl, `products/${slug}`),
      priceCurrency: "BDT",
      price,
      priceValidUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1),
      )
        .toISOString()
        .split("T")[0],
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: seo.siteName },
    },
    ...(product?.avarage_review_ratting && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product?.avarage_review_ratting,
        reviewCount: product?.total_review_ratting || 1,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  return (
    <section className="bg-[#F4F4F4] py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SingleProduct product={product} />
    </section>
  );
};

export default ProductDetailsPage;
