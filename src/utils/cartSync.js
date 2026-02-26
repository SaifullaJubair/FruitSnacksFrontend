import { BASE_URL } from "@/components/utils/baseURL";
import { setCartFromDB } from "@/redux/feature/cart/cartSlice";

/**
 * Login এর পরে localStorage cart DB তে sync করো।
 * LoginForm এ userLogin success এর পরে call করো।
 *
 * @param {Array} localProducts - Redux state এর products array
 * @param {Function} dispatch - Redux dispatch
 */
export const syncCartAfterLogin = async (localProducts, dispatch) => {
  try {
    // localStorage cart DB তে পাঠাও
    const products = localProducts.map((item) => ({
      product_id: item.productId,
      variation_id: item.variation_product_id || null,
      quantity: item.quantity,
    }));

    const res = await fetch(`${BASE_URL}/cart/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ products }),
    });

    if (!res.ok) return; // silent fail

    const data = await res.json();

    // DB থেকে merged cart Redux এ set করো
    if (data?.data?.length) {
      dispatch(setCartFromDB(data.data));
    }
  } catch (error) {
    console.error("Cart sync error:", error);
  }
};

/**
 * Page load এ (logged in user) DB থেকে cart load করো।
 * Layout বা providers এ একবার call করো।
 *
 * @param {Function} dispatch - Redux dispatch
 */
export const loadCartFromDB = async (dispatch) => {
  try {
    const res = await fetch(`${BASE_URL}/cart`, {
      credentials: "include",
    });

    if (!res.ok) return;

    const data = await res.json();

    if (data?.data?.length) {
      dispatch(setCartFromDB(data.data));
    }
  } catch (error) {
    console.error("Cart load error:", error);
  }
};
