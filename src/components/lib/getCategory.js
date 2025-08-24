import { BASE_URL } from "../utils/baseURL";

export async function getCategory() {
  const res = await fetch(`${BASE_URL}/category`, {
    cache: "no-cache",
  });

  if (!res.ok) {
    throw new Error("category fetching error!");
  }

  return res.json();
}
