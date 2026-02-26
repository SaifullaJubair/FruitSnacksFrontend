"use client";

import Image from "next/image";
import Link from "next/link";
import useGetSettingData from "@/components/lib/getSettingData";
import ProductSectionSkeleton from "@/components/shared/loader/ProductSectionSkeleton";
import { isHexColor, lineThroughPrice, productPrice } from "@/utils/helper";
import { FiArrowUpRight } from "react-icons/fi";

const LatestProductGrid = ({ products, isLoading }) => {
  const { data: settingsData } = useGetSettingData();
  const currencySymbol = settingsData?.data[0];

  if (isLoading) return <ProductSectionSkeleton />;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products?.map((product) => (
        <Link
          key={product?._id}
          href={`/products/${product?.product_slug}`}
          className="group bg-white border border-gray-100 hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
        >
          {/* Image */}
          <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-50">
            <Image
              fill
              src={product?.main_image || "/assets/images/placeholder.jpg"}
              alt={product?.product_name || "Product"}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* New Badge */}
            <span className="absolute top-2 left-2 bg-black text-white text-[10px] tracking-widest uppercase px-2 py-1">
              New
            </span>
            {/* Arrow icon on hover */}
            <div className="absolute bottom-2 right-2 bg-white p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <FiArrowUpRight className="text-gray-800 text-base" />
            </div>
          </div>

          {/* Info */}
          <div className="p-3 border-t border-gray-100">
            <h3 className="text-sm text-gray-800 line-clamp-1 mb-2">
              {product?.product_name}
            </h3>

            {/* Colors */}
            <div className="flex items-center gap-1 mb-2">
              {product?.attributes_details?.attribute_values
                ?.filter((c) => isHexColor(c?.attribute_value_code))
                ?.slice(0, 4)
                ?.map((color) => (
                  <span
                    key={color?._id}
                    className="w-3 h-3 rounded-full border border-gray-200 inline-block"
                    style={{ backgroundColor: color?.attribute_value_code }}
                    title={color?.attribute_value_name}
                  />
                ))}
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">
                {currencySymbol?.currency_symbol}{productPrice(product)}
              </span>
              {lineThroughPrice(product) && (
                <span className="text-xs line-through text-gray-400">
                  {currencySymbol?.currency_symbol}{lineThroughPrice(product)}
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default LatestProductGrid;