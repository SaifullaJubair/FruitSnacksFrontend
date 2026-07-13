import { Suspense } from "react";
import { getJustForYouProducts } from "@/components/lib/getJustForProducts";
import ProductCardSkeleton from "@/components/common/ProductCardSkeleton";
import CategoryWiseGroups from "./CategoryWiseGroups";

/**
 * Category-wise strip — Server Component.
 *
 * The backend endpoint (`/product/just_for_you_product`) fans out a Mongo
 * aggregate per `explore_category_show` category, with no cap. Client-side that
 * cost sat off the critical path (it ran after hydration); moved server-side it
 * would block the HTML response on a cache miss. So this section streams inside
 * its own <Suspense> boundary — the rest of the page ships immediately and this
 * strip fills in when its data lands, instead of holding up the whole shell.
 */
async function CategoryWiseContent() {
  const res = await getJustForYouProducts();
  const data = res?.data || [];
  if (!data.length) return null;

  return <CategoryWiseGroups data={data} />;
}

function CategoryWiseSkeleton() {
  return (
    <section className="py-10 md:py-14 bg-gray-50">
      <div className="max-w-[98%] mx-auto px-2">
        <div className="h-9 w-56 bg-gray-200 rounded-lg animate-pulse mb-8" />
        <div className="flex flex-col gap-8">
          {[0, 1].map((i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-5 lg:grid-cols-6 gap-4">
              <div className="sm:col-span-2 aspect-[4/3] sm:aspect-auto sm:min-h-[320px] bg-gray-200 rounded-2xl animate-pulse" />
              <div className="sm:col-span-3 lg:col-span-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <ProductCardSkeleton count={3} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CategoryWiseProduct() {
  return (
    <Suspense fallback={<CategoryWiseSkeleton />}>
      <CategoryWiseContent />
    </Suspense>
  );
}
