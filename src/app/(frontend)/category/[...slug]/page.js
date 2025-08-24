import CategoryViewSection from "@/components/categoryview/CategoryViewSection";
import { getFilterData } from "@/components/lib/getFilterData";
import { getFilterHeadData } from "@/components/lib/getFilterHeadData";

export async function generateMetadata({ params }) {
  const { slug } = params;

  return {
    title: slug[slug.length - 1],
  };
}

const CategoryPage = async ({ params }) => {
  const { slug } = params;
  const [categoryType, subCategoryType, childCategoryType] = slug || [];
  // console.log(slug[0]);
  const promiseFilterData = getFilterData(slug[0]);
  const promiseFilterHeadData = getFilterHeadData({
    categoryType,
    subCategoryType,
    childCategoryType,
  });

  const [filterData, filterHeadData] = await Promise.all([
    promiseFilterData,
    promiseFilterHeadData,
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
