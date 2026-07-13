import { getNewArrivalProducts } from "@/components/lib/getNewArrivalProducts";
import LatestProductGrid from "./LatestProductGrid";
import { SectionHeader } from "../trendingProduct/TrendingProduct";

// RSC — data is fetched on the server so the product image URLs are present in
// the initial HTML (the client-fetch waterfall was the 16.1s-LCP root cause).
const LatestProducts = async () => {
  const data = await getNewArrivalProducts({ page: 1, limit: 8 });

  return (
    <section className="py-10 md:py-14 bg-gray-50">
      <div className="max-w-[98%] mx-auto px-2">
        <SectionHeader
          label="New"
          accent="Arrival"
          href="/shop"
          linkText="All Products"
        />
        <LatestProductGrid products={data?.data} isLoading={false} />
      </div>
    </section>
  );
};

export default LatestProducts;
