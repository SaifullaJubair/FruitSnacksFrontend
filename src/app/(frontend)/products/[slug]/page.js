import { BASE_URL } from "@/components/utils/baseURL";
import SingleProduct from "@/components/frontend/singeProduct/SingleProduct";
import Link from "next/link";
import { Button } from "@/components/ui/button";
// import RelatedProducts from "@/components/frontend/singeProduct/relatedProducts/RelatedProducts";

export async function generateMetadata({ params }) {
  const { slug } = params;

  const productDataResponse = await fetch(`${BASE_URL}/product/${slug}`, {
    next: { revalidate: 30 },
  });

  // Check if the response is okay (status code 200-299 )
  if (!productDataResponse.ok) {
    console.log("Failed to fetch product data");
  }

  // Convert the response to JSON
  const productData = await productDataResponse.json();
  return {
    title: productData?.data?.product_name || "product Name",
    description: productData?.data?.meta_description || "product Description",
    openGraph: {
      type: "article",
      title: productData?.data?.product_name,
      description: productData?.data?.meta_description,
      url: `https://artisenleather.com/${slug}`,
      images: [
        {
          url: productData?.data?.main_image,
          alt: productData?.data?.product_name,
        },
      ],
    },
    metadataBase: new URL("https://artisenleather.com/"),
    author: {
      name: "Fashion For You",
    },
  };
}

const ProductDetailsPage = async ({ params }) => {
  const { slug } = params;
  const res = await fetch(`${BASE_URL}/product/${slug}`, {
    next: { revalidate: 60 },
  });
  const data = await res.json();
  const product = data?.data;
  if (!product) {
    return (
      <div className="text-center max-w-md mx-auto mt-2 bg-white p-6   shadow-lg">
        <img
          src="/assets/images/empty/Empty-cuate.png"
          alt="Product not found"
          className="mx-auto mb-2 w-80 sm:w-96 "
        />
        <h3 className="font-semibold text-gray-800 mb-2">Product Not Found!</h3>
        <p className="text-gray-600 mb-6">
          We couldn’t find the product you’re looking for. It might have been
          removed or the URL might be incorrect.
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Link href="/">
            <Button className="w-full">Go Home</Button>
          </Link>

          <Link href="/all-products">
            <Button variant="secondary" className="w-full">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  return (
    <section className="bg-[#F4F4F4] py-6">
      <SingleProduct product={product} />
    </section>
  );
};

export default ProductDetailsPage;
