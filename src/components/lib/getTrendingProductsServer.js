import { cache } from "react";
import { BASE_URL } from "../utils/baseURL";

// Server helper for the trending-products list (RSC). Wrapped in React.cache()
// so hero_spotlight, product_features and trending_products — all of which read
// this same list — share ONE fetch per request instead of three.
//
// Fails soft: a dead backend degrades the section to empty, it must not 500 the
// whole homepage (there is no error boundary under (frontend)/ yet).
export const getTrendingProductsServer = cache(async () => {
  try {
    const res = await fetch(`${BASE_URL}/product/trending_product`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
});
