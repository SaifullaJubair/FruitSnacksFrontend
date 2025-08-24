import { BASE_URL } from "@/components/utils/baseURL";
import qs from "qs";

export const fetchCartDetails = async (cartProducts) => {
  const queryString = qs.stringify(
    {
      products: cartProducts?.map((item) => ({
        product_id: item?.productId,
        variation_id: item?.variation_product_id,
        quantity: item?.quantity,
      })),
    },
    { encode: false }
  );

  try {
    const response = await fetch(
      `${BASE_URL}/product/cart_product?${queryString}`
    );
    if (!response.ok) throw new Error("Failed to fetch cart details");
    return await response.json();
  } catch (error) {
    throw new Error("Error fetching cart details");
  }
};
