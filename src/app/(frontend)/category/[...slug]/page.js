// src/app/(frontend)/category/[...slug]/page.js
import CategoryViewSection from "@/components/categoryview/CategoryViewSection";
import { getFilterData } from "@/components/lib/getFilterData";
import { getFilterHeadData } from "@/components/lib/getFilterHeadData";
import { getSeoConfig } from "@/components/lib/getSeoConfig";

export async function generateMetadata({ params }) {
  const { slug } = params;
  const [categoryType, subCategoryType] = slug || [];
  const seo = await getSeoConfig();

  try {
    const filterHeadData = await getFilterHeadData({
      categoryType,
      subCategoryType,
      childCategoryType: undefined,
    });

    const headData = filterHeadData?.data;
    const categoryName =
      headData?.[0]?.category_id?.category_name ||
      categoryType
        ?.split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    const subCategoryName =
      subCategoryType && subCategoryType !== "undefined"
        ? subCategoryType
            ?.split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
        : null;

    const pageTitle = subCategoryName
      ? `${subCategoryName} – ${categoryName}`
      : categoryName;

    const description = `${seo.siteName} এর ${pageTitle} collection। Genuine leather, premium quality, affordable price। Cash on delivery সারাদেশে।`;
    const canonicalSlug = slug.join("/");

    return {
      title: pageTitle,
      description,
      alternates: { canonical: `${seo.siteUrl}/category/${canonicalSlug}` },
      openGraph: {
        type: "website",
        url: `${seo.siteUrl}/category/${canonicalSlug}`,
        title: `${pageTitle} | ${seo.siteName}`,
        description,
        siteName: seo.siteName,
        images: [{ url: seo.logo, alt: pageTitle }],
      },
    };
  } catch {
    const readableName = categoryType
      ?.split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return { title: readableName };
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
