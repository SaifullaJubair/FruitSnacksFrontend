import { BASE_URL } from "../utils/baseURL";

export async function getFlashSaleProducts() {
  const res = await fetch(`${BASE_URL}/flash_sale`, {
    next: {
      revalidate: 30,
    },
  });

  if (!res.ok) {
    throw new Error("Flash sale fetching error!");
  }

  return res.json();
}
