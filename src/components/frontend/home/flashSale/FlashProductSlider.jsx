"use client";
import Image from "next/image";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import {
  Navigation,
  Scrollbar,
  A11y,
  Keyboard,
  Parallax,
  Autoplay,
} from "swiper/modules";

import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/bundle";
import Link from "next/link";
const FlashProductSlider = ({ products }) => {
  return (
    <Swiper
      modules={[Navigation, Scrollbar, A11y, Keyboard, Parallax, Autoplay]}
      slidesPerView={2}
      spaceBetween={20}
      loop={true}
      autoplay={{
        delay: 3000,
        pauseOnMouseEnter: true,
        reverseDirection: true,
      }}
      keyboard={{ enabled: true }}
      breakpoints={{
        640: { slidesPerView: 2 },
        768: { slidesPerView: 4 },
        1024: { slidesPerView: 5 },
        1280: { slidesPerView: 6 },
      }}
      className="flex-1 ml-6  cursor-grab"
    >
      {products?.map((product) => (
        <SwiperSlide
          key={product?.flash_sale_product?._id}
          className="bg-white   shadow-md border-primaryVariant-100 border hover:shadow-lg transition-shadow duration-300 h-[400px]" // Fixed height
        >
          <Link href={`/${product?.flash_sale_product?.product_slug}`}>
            <div className="relative p-2 group">
              {product?.flash_sale_product?.isNew && (
                <span className="absolute top-0 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded-br-lg rounded-tl-lg">
                  New
                </span>
              )}
              <Image
                src={product?.flash_sale_product?.main_image}
                alt={product?.flash_sale_product?.product_name}
                width={200}
                height={200}
                className="w-full h-44 xl:h-52 object-cover group-hover:scale-105 transition-transform duration-300" // Hover effect
              />
            </div>
            <div className="p-3 flex flex-col justify-between h-[calc(360px-200px)]">
              {/* Adjusted for spacing */}
              <div>
                <h5 className="mt-2 font-semibold line-clamp-2">
                  {product?.flash_sale_product?.product_name}
                </h5>
                <p className="text-sm text-gray-500 line">
                  {product?.flash_sale_product?.brand?.brand_name}
                </p>
              </div>
              <div>
                <div className="flex items-center mt-2">
                  {Array.from({ length: 5 }, (_, index) => {
                    if (product.rating > index) {
                      return <FaStar key={index} className="text-yellow-400" />;
                    }
                    return (
                      <FaStarHalfAlt key={index} className="text-yellow-400" />
                    );
                  })}
                  <span className="ml-2 text-sm text-gray-500">
                    ({product.reviews} reviews)
                  </span>
                </div>
                <div className="flex items-center justify-between space-x-2 mt-3">
                  <div>
                    <span className="text-lg font-semibold">
                      {product?.flash_sale_product?.is_variation ? (
                        <>
                          $
                          {product?.flash_sale_product?.variations?.[0]
                            ?.variation_discount_price
                            ? product?.flash_sale_product?.variations?.[0]
                                ?.variation_discount_price
                            : product?.flash_sale_product?.variations?.[0]
                                ?.variation_price}
                        </>
                      ) : (
                        <>
                          ${" "}
                          {product?.flash_sale_product?.product_discount_price
                            ? product?.flash_sale_product
                                ?.product_discount_price
                            : product?.flash_sale_product?.product_price}
                        </>
                      )}
                    </span>
                    <span className="text-sm ml-2 line-through text-gray-400">
                      {(product?.flash_sale_product?.variations?.[0]
                        ?.variation_discount_price ||
                        product?.flash_sale_product
                          ?.product_discount_price) && (
                        <>
                          ${" "}
                          {product?.flash_sale_product?.variations?.[0]
                            ?.variation_discount_price
                            ? product?.flash_sale_product?.variations?.[0]
                                ?.variation_price
                            : product?.flash_sale_product
                                ?.product_discount_price
                            ? product?.flash_sale_product?.product_price
                            : null}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default FlashProductSlider;
