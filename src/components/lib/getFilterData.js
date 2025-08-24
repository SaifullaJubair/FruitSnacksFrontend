import { BASE_URL } from "../utils/baseURL";

export async function getFilterData(slug) {
  const res = await fetch(
    `${BASE_URL}/filter_product/side_filtered_data/${slug}`,
    {
      next: {
        revalidate: 10,
      },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}
