// src/app/(frontend)/category/[...slug]/page.js
import CategoryViewSection from "@/components/categoryview/CategoryViewSection";
import { getFilterData } from "@/components/lib/getFilterData";
import { getFilterHeadData } from "@/components/lib/getFilterHeadData";
import { getSeoConfig } from "@/components/lib/getSeoConfig";

// slug থেকে readable নাম বানানোর helper
const slugToName = (slug) =>
  slug
    ?.split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export async function generateMetadata({ params }) {
  const { slug } = params;
  const [categoryType, subCategoryType] = slug || [];

  // ✅ একসাথে fetch — double call না
  const [seo, filterHeadData] = await Promise.all([
    getSeoConfig(),
    getFilterHeadData({
      categoryType,
      subCategoryType,
      childCategoryType: undefined,
    }),
  ]);

  try {
    const headData = filterHeadData?.data;
    const categoryName =
      headData?.[0]?.category_id?.category_name || slugToName(categoryType);

    const subCategoryName =
      subCategoryType && subCategoryType !== "undefined"
        ? slugToName(subCategoryType)
        : null;

    const pageTitle = subCategoryName
      ? `${subCategoryName} – ${categoryName}`
      : categoryName;

    const description = `${seo.siteName} এর ${pageTitle} collection। Genuine leather, premium quality, affordable price। Cash on delivery সারাদেশে।`;
    const canonicalSlug = slug.join("/");
    const url = seo.joinUrl(seo.siteUrl, `category/${canonicalSlug}`);

    return {
      title: pageTitle,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "website",
        locale: "bn_BD",
        siteName: seo.siteName,
        url,
        title: pageTitle,
        description,
        images: [{ url: seo.logo, width: 1200, height: 630, alt: pageTitle }],
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description,
        images: [seo.logo],
      },
    };
  } catch {
    return {
      title: slugToName(categoryType),
      robots: { index: false },
    };
  }
}

const CategoryPage = async ({ params }) => {
  const { slug } = params;
  const [categoryType, subCategoryType, childCategoryType] = slug || [];

  const [filterData, filterHeadData] = await Promise.all([
    getFilterData(slug[0]),
    getFilterHeadData({ categoryType, subCategoryType, childCategoryType }),
  ]);

  return (
    <div className="container mx-auto px-2 pb-5">
      <CategoryViewSection
        slug={slug}
        filterData={filterData?.data}
        filterHeadData={filterHeadData?.data}
      />
    </div>
  );
};

export default CategoryPage;
