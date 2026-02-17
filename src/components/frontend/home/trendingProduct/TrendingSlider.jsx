"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import useGetSettingData from "@/components/lib/getSettingData";
import ProductSectionSkeleton from "@/components/shared/loader/ProductSectionSkeleton";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";
import { isHexColor, lineThroughPrice, productPrice } from "@/utils/helper";

const TrendingSlider = ({ products, isLoading }) => {
  const { data: settingsData } = useGetSettingData();
  const currencySymbol = settingsData?.data[0];

  return (
    <div className="relative">
      {isLoading ? (
        <ProductSectionSkeleton />
      ) : (
        <>
          <Swiper
            modules={[Navigation, Autoplay, Keyboard]}
            slidesPerView={2}
            spaceBetween={10}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 15,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 15,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
              1280: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
            }}
            navigation={{
              nextEl: ".custom-next",
              prevEl: ".custom-prev",
            }}
            autoplay={{
              delay: 3000,
              pauseOnMouseEnter: true,
            }}
            keyboard={{ enabled: true }}
            loop={true}
          >
            {products?.map((product) => (
              <SwiperSlide key={product?._id}>
                <div className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 group h-full border border-gray-200 ">
                  <Link
                    href={`/products/${product?.product_slug}`}
                    className="group overflow-hidden h-full flex flex-col"
                  >
                    {/* Your existing product card content */}
                    <div className="relative w-full aspect-[2/3] overflow-hidden flex-grow">
                      {product?.main_video ? (
                        <video
                          src={product.main_video}
                          autoPlay
                          loop
                          muted
                          className="absolute inset-0 h-full w-full object-cover group-hover:scale-125 transition-transform duration-300"
                        />
                      ) : (
                        <Image
                          fill
                          src={
                            product?.main_image ||
                            "/assets/images/placeholder.jpg"
                          }
                          alt={product?.product_name || "Product Image"}
                          className="absolute inset-0 h-full w-full object-cover group-hover:scale-125 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <div className="relative bg-white py-3 px-2">
                      <h3 className="text-sm text-gray-700 group-hover:underline group-hover:underline-offset-4 line-clamp-1">
                        {product?.product_name}
                      </h3>
                      <div className="mt-3 flex flex-wrap-reverse flex-col-reverse gap-y-1 sm:flex-row sm:justify-between text-sm lg:text-base mb-1.5">
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
                          {product?.attributes_details?.attribute_values
                            ?.filter((color) =>
                              isHexColor(color?.attribute_value_code),
                            )
                            ?.slice(0, 4)
                            ?.map((color) => (
                              <span
                                key={color?._id}
                                className="w-4 h-4 lg:w-5 lg:h-5 inline-block rounded-full border border-gray-300 mr-1"
                                style={{
                                  backgroundColor: color?.attribute_value_code,
                                }}
                                title={color?.attribute_value_name}
                              />
                            ))}
                          {product?.attributes_details?.attribute_values?.filter(
                            (color) => isHexColor(color?.attribute_value_code),
                          )?.length > 4 && (
                            <span className="w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center rounded-full bg-gray-300 text-xs text-gray-700 ml-1">
                              +
                              {product?.attributes_details?.attribute_values?.filter(
                                (color) =>
                                  isHexColor(color?.attribute_value_code),
                              ).length - 4}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <button className="custom-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition-all duration-300 transform -translate-x-1/2">
            <FaAngleLeft className="text-lg" />
          </button>
          <button className="custom-next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition-all duration-300 transform translate-x-1/2">
            <FaAngleRight className="text-lg" />
          </button>
        </>
      )}
    </div>
  );
};

export default TrendingSlider;
