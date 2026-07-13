import { getTrendingProductsServer } from "@/components/lib/getTrendingProductsServer";
import { getServerSettingData } from "@/components/lib/getServerSettingData";
import ProductFeaturesList from "./ProductFeaturesList";

/**
 * Product Features — the big alternating product rows. Boutique preset section.
 *
 * Server Component: it fetches the trending list here so the row images are in
 * the initial HTML instead of appearing only after hydration + a client fetch.
 * `getTrendingProductsServer` is React.cache()-wrapped, so this and HeroSpotlight
 * (which reads the same list) share ONE fetch per request.
 *
 * Everything interactive — variation chips, media carousel, cart/wishlist —
 * lives in the ProductFeaturesList client leaf and receives plain props.
 */
export default async function ProductFeatures() {
  const [data, settingsData] = await Promise.all([
    getTrendingProductsServer(),
    getServerSettingData().catch(() => null),
  ]);

  const products = data?.data?.data || [];
  if (!products.length) return null;

  const currency = settingsData?.data?.[0]?.currency_symbol || "৳";

  return <ProductFeaturesList products={products} currency={currency} />;
}
