// src/app/(frontend)/cart/page.jsx
import AddToCart from "@/components/frontend/cart/AddToCart";

import { buildPageMeta } from "@/components/lib/buildPageMeta";

export async function generateMetadata() {
  return buildPageMeta("cart");
}
const AddCartPage = () => {
  return (
    <div>
      <AddToCart />
    </div>
  );
};

export default AddCartPage;
