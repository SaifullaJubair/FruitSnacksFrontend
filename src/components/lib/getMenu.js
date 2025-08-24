import { BASE_URL } from "../utils/baseURL";

export async function getMenu() {
  const res = await fetch(`${BASE_URL}/category/category_sub_child`, {
    cache: "no-cache",
  });

  if (!res.ok) {
    throw new Error("Menu data fetching error!");
  }

  return res.json();
}
