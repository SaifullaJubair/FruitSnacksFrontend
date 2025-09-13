// PopularProducts.js

import { getJustForYouProducts } from "@/components/lib/getJustForProducts";
import { getServerSettingData } from "@/components/lib/getServerSettingData";
import ProductSectionSkeleton from "@/components/shared/loader/ProductSectionSkeleton";
import { Button } from "@/components/ui/button";
import { titleFont } from "@/utils/font";
import { isHexColor, lineThroughPrice, productPrice } from "@/utils/helper";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { IoIosArrowRoundForward } from "react-icons/io";

const OnlyForYouProduct = async () => {
  const data = await getJustForYouProducts();
  const products = data?.data?.data;
  //get Setting Data
  const settingData = await getServerSettingData();
  const currencySymbol = settingData?.data[0];
  return (
    <div className="my-10">
      <div className="max-w-[98%] mx-auto">
        <div className="flex justify-between items-center pb-8">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900"
            style={{
              fontFamily: titleFont.style.fontFamily,
            }}
          >
            New <span className="text-primaryVariant-500">Arrival</span>
          </h2>
          <Link href={"/latest-product"}>
            {" "}
            <Button variant="link">
              See All Product
              <IoIosArrowRoundForward />
            </Button>
          </Link>
        </div>

        <Suspense fallback={<ProductSectionSkeleton />}></Suspense>
        <div className="grid grid-cols-2 md:grid-cols-3  lg:grid-cols-4 gap-4 md:gap-y-6">
          {products?.slice(0, 10)?.map((product, index) => (
            <Link
              href={`/products/${product?.product_slug}`}
              key={index}
              className="bg-white shadow-md  hover:scale-105 transition-transform duration-300 group block"
            >
              <div className="relative w-full aspect-[2/3] overflow-hidden">
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
                    src={
                      product?.main_image || "/assets/images/placeholder.jpg"
                    } // Fallback image
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
                      ?.filter((color) =>
                        isHexColor(color?.attribute_value_code)
                      )
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
      </div>
    </div>
  );
};

export default OnlyForYouProduct;
