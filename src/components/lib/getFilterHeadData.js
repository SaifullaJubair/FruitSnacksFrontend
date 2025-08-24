
import { BASE_URL } from "../utils/baseURL";

export async function getFilterHeadData({
  categoryType,
  subCategoryType,
  childCategoryType,
}) {
  const res = await fetch(
    `${BASE_URL}/filter_product/heading_sub_child_category_data?categoryType=${categoryType}&sub_categoryType=${subCategoryType}&child_categoryType=${childCategoryType}`,
    {
      next: {
        revalidate: 10,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Filter Heading data Failed to fetch!");
  }

  return res.json();
}
