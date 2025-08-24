import { BASE_URL } from "../utils/baseURL";

export async function getECommerceChoiceProducts() {
  const res = await fetch(`${BASE_URL}/product/ecommerce_choice_product`, {
    next: {
      revalidate: 30,
    },
  });

  if (!res.ok) {
    throw new Error("E-Commerce choice fetching error!");
  }

  return res.json();
}
