import Shop from "@/components/frontend/shop/Shop";
import { buildPageMeta } from "@/components/lib/buildPageMeta";

export async function generateMetadata() {
  return buildPageMeta("shop");
}
const ShopPage = () => {
  return (
    <div>
      <Shop />
    </div>
  );
};

export default ShopPage;
