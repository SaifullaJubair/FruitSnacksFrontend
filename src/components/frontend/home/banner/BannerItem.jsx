"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Image from "next/image"; // Next.js Image Component
import { images } from "@/components/utils/ImageImport";
import { Suspense } from "react";
import ProductSectionSkeleton from "@/components/shared/loader/ProductSectionSkeleton";
import { Button } from "@/components/ui/button";

const BannerItem = ({ bannerData }) => {
  if (!bannerData?.length) return null;

  return (
    <div className="w-full">
      <Swiper
        modules={[Pagination, Autoplay]}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        loop={true}
        spaceBetween={10}
        slidesPerView={1}
        className="w-full"
      >
        <Suspense fallback={<ProductSectionSkeleton />}></Suspense>
        {bannerData?.map((banner, i) => (
          <SwiperSlide key={banner?._id || i}>
            <div>
              {/* Next.js Image component for optimized images */}{" "}
              {/* Container with 2:3 aspect ratio */}
              <div className="relative w-full aspect-[3/1] overflow-hidden ">
                <Image
                  src={banner?.banner_image} // Fallback for missing image
                  alt={`Banner ${i}`}
                  fill
                  placeholder="blur"
                  property
                  blurDataURL={images.loadingProductImg}
                />
              </div>
              {/* Banner Title positioned above the Shop Now button */}
              {/* <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center text-white bg-black bg-opacity-50 px-4 py-2 rounded-md">
                <h2 className="text-sm sm:text-lg  md:text-xl lg:text-2xl text-slate-300 font-bold">
                  {banner?.banner_title || "Made for creating tasty memories"}
                </h2>
              </div>
              <Button className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <a
                  href={banner?.banner_path || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Shop Now
                </a>
              </Button> */}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BannerItem;
