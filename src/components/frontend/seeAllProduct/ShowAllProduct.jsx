import PaginationWithPageBtn from "@/components/common/paginationWithPageBtn/PaginationWithPageBtn";
import useGetSettingData from "@/components/lib/getSettingData";
import ProductSectionSkeleton from "@/components/shared/loader/ProductSectionSkeleton";
import { averageRatingStar } from "@/utils/average";
import { isHexColor, lineThroughPrice, productPrice } from "@/utils/helper";

import Image from "next/image";
import Link from "next/link";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

const ShowAllProduct = ({
  products,
  isLoading,
  page,
  setPage,
  rows,
  setRows,
  totalData,
}) => {
  const { data: settingsData } = useGetSettingData();

  const currencySymbol = settingsData?.data[0];

  return (
    <>
      {isLoading ? (
        <ProductSectionSkeleton />
      ) : (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-y-6">
            {products?.map((product, index) => (
              <Link
                href={`/products/${product?.product_slug}`}
                className="group block overflow-hidden"
                key={index}
              >
                <div className="relative w-full aspect-[2/3] overflow-hidden">
                  {product?.main_video ? (
                    <video
                      src={product.main_video}
                      autoPlay
                      loop
                      muted
                      //
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-125 transition-transform duration-300"
                    />
                  ) : (
                    <Image
                      fill
                      src={
                        product?.main_image || "/assets/images/placeholder.jpg"
                      } // Fallback image
                      alt={product?.product_name || "Product Image"}
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-125 transition-transform duration-300"
                    />
                  )}
                </div>
                {/* product details */}
                <div className="relative bg-white py-3 px-2">
                  <h3 className="text-sm text-gray-700 group-hover:underline group-hover:underline-offset-4 line-clamp-1">
                    {product?.product_name}
                  </h3>
                  {/* Price Section */}
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
                      {/* Ensure attributes_details is an array and extract color values */}
                      {Array.isArray(product?.attributes_details) &&
                        product.attributes_details
                          .filter(
                            (attr) =>
                              Array.isArray(attr.attribute_values) &&
                              attr.attribute_values.some((val) =>
                                isHexColor(val?.attribute_value_code)
                              )
                          ) // Keep only attributes that contain valid hex colors
                          .flatMap((attr) => attr.attribute_values) // Flatten color values
                          .filter((val) =>
                            isHexColor(val?.attribute_value_code)
                          ) // Ensure only valid hex colors
                          .slice(0, 4) // Show first 4 colors
                          .map((color) => (
                            <span
                              key={color?._id}
                              className="w-4 h-4 lg:w-5 lg:h-5 inline-block rounded-full border border-gray-300 mr-1"
                              style={{
                                backgroundColor: color?.attribute_value_code,
                              }}
                              title={color?.attribute_value_name}
                            />
                          ))}

                      {/* Show count of remaining colors if more than 4 exist */}
                      {Array.isArray(product?.attributes_details) &&
                        product.attributes_details
                          .flatMap((attr) =>
                            Array.isArray(attr.attribute_values)
                              ? attr.attribute_values
                              : []
                          ) // Ensure valid attribute_values
                          .filter((val) =>
                            isHexColor(val?.attribute_value_code)
                          ).length > 4 && ( // Filter valid hex colors
                          <span className="w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center rounded-full bg-gray-300 text-xs text-gray-700 ml-1">
                            +
                            {product.attributes_details
                              .flatMap((attr) =>
                                Array.isArray(attr.attribute_values)
                                  ? attr.attribute_values
                                  : []
                              )
                              .filter((val) =>
                                isHexColor(val?.attribute_value_code)
                              ).length - 4}
                          </span>
                        )}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {totalData > rows && (
            <PaginationWithPageBtn
              page={page}
              setPage={setPage}
              rows={rows}
              setRows={setRows}
              totalData={totalData}
            />
          )}
        </div>
      )}
    </>
  );
};

export default ShowAllProduct;
