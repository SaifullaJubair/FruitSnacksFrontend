"use client";
import Link from "next/link";
import Image from "next/image";
import useGetRelatedProducts from "@/components/lib/getRelatedProduct";
import { isHexColor, lineThroughPrice, productPrice } from "@/utils/helper";
import ProductSectionSkeleton from "@/components/shared/loader/ProductSectionSkeleton";
import useGetSettingData from "@/components/lib/getSettingData";

const RelatedProducts = ({ product_slug }) => {
  const { data: settingsData } = useGetSettingData();

  const currencySymbol = settingsData?.data[0];
  const { data: relatedProduct, isLoading } = useGetRelatedProducts({
    product_slug,
  });
  if (isLoading) return <ProductSectionSkeleton />;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-y-6">
      {relatedProduct?.data?.map((product, index) => (
        <Link
          href={`/products/${product?.product_slug}`}
          key={index}
          className="bg-white shadow-md relative hover:scale-105 transition-transform duration-300 group block"
        >
          <div className="relative w-full aspect-[2/3] overflow-hidden">
            {/* <button
              type="button"
              className="absolute top-2 right-2 p-1 bg-white rounded-full hover:bg-gray-100 z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button> */}
            {/* Default (Visible) Image or Video */}
            {product?.main_video ? (
              <video
                src={product.main_video}
                autoPlay
                loop
                muted
                className="absolute inset-0 h-full w-full object-cover opacity-100 group-hover:opacity-0 transition-opacity duration-300"
              />
            ) : (
              <Image
                fill
                src={product?.main_image || "/assets/images/placeholder.jpg"} // Fallback image
                alt={product?.product_name || "Product Image"}
                className="absolute inset-0 h-full w-full object-cover opacity-100 group-hover:opacity-0 transition-opacity duration-300"
              />
            )}

            {/* Hover (Alternate) Image */}
            <Image
              fill
              src={
                product?.is_variation
                  ? product?.variations?.variation_image
                    ? product?.variations?.variation_image
                    : product?.main_image
                  : product?.other_images?.other_image
                  ? product?.other_images?.other_image
                  : product?.main_image || "/assets/images/placeholder.jpg"
              } // Fallback to main image if hover image is missing
              alt={product?.product_name || "Product Hover Image"}
              className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
          </div>
          <div className="mt-1.5 px-2">
            <p className="text-gray-900 group-hover:underline group-hover:underline-offset-4 line-clamp-2 pr-1 ">
              {product?.product_name}
            </p>

            {/* <div className="mt-1.5 flex gap-1">
                  {product?.attributes_details?.attribute_values?.map}
                </div> */}
            {/* if color here will be show color circel like red, green, blue */}

            <div className="mt-3 flex flex-wrap-reverse flex-col-reverse gap-y-1 sm:flex-row sm:justify-between text-sm lg:text-base mb-1.5 ">
              <p className="tracking-wide whitespace-nowrap">
                <span className="text-sm font-semibold">
                  {currencySymbol?.currency_symbol}

                  {productPrice(product)}
                </span>
                {lineThroughPrice(product) && (
                  <span className="text-xs ml-1 line-through text-gray-400">
                    {currencySymbol?.currency_symbol}
                    {lineThroughPrice(product)}
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 flex flex-wrap items-center">
                {/* Filter and get hex color attributes */}
                {product?.attributes_details?.attribute_values
                  ?.filter((color) => isHexColor(color?.attribute_value_code))
                  ?.slice(0, 4) // Show only the first 4 colors
                  ?.map((color) => (
                    <span
                      key={color?._id}
                      className="w-4  h-4 lg:w-5 lg:h-5 inline-block rounded-full border border-gray-300 mr-1"
                      style={{
                        backgroundColor: color?.attribute_value_code,
                      }}
                      title={color?.attribute_value_name}
                    />
                  ))}

                {/* Show count of remaining colors if more than 4 exist */}
                {product?.attributes_details?.attribute_values?.filter(
                  (color) => isHexColor(color?.attribute_value_code)
                )?.length > 4 && (
                  <span className="w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center rounded-full bg-gray-300 text-xs text-gray-700 ml-1">
                    +
                    {product?.attributes_details?.attribute_values?.filter(
                      (color) => isHexColor(color?.attribute_value_code)
                    ).length - 4}
                  </span>
                )}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RelatedProducts;
