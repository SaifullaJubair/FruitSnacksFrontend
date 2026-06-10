"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import Image from "next/image";
import Link from "next/link";
import { images } from "@/components/utils/ImageImport";

const PLACEHOLDER_BANNERS = [
  {
    _id: "ph1",
    banner_image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1400&q=80",
    banner_title: "Fresh Fruits Delivered Daily",
    banner_path: "/shop",
  },
  {
    _id: "ph2",
    banner_image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=1400&q=80",
    banner_title: "Premium Snacks Collection",
    banner_path: "/shop",
  },
  {
    _id: "ph3",
    banner_image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=1400&q=80",
    banner_title: "Healthy & Delicious",
    banner_path: "/shop",
  },
];

const BannerItem = ({ bannerData }) => {
  const items = bannerData?.length ? bannerData : PLACEHOLDER_BANNERS;

  return (
    <div className="w-full">
      <Swiper
        modules={[Pagination, Autoplay, EffectFade]}
        effect="fade"
        autoplay={{ delay: 4500, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          renderBullet: (_, className) =>
            `<span class="${className} !w-6 !h-1.5 !rounded-sm !bg-white/50 [&.swiper-pagination-bullet-active]:!bg-white [&.swiper-pagination-bullet-active]:!w-8 transition-all duration-300"></span>`,
        }}
        loop={true}
        slidesPerView={1}
        className="w-full"
      >
        {items?.map((banner, i) => (
          <SwiperSlide key={banner?._id || i}>
            <div className="relative w-full aspect-[3/1] sm:aspect-[16/5] overflow-hidden bg-gray-900">
              <Image
                src={banner?.banner_image}
                alt={banner?.banner_title || `Banner ${i + 1}`}
                fill
                className="object-cover opacity-90"
                placeholder="blur"
                blurDataURL={images.loadingProductImg}
                priority={i === 0}
              />
              {/* gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-transparent" />

              {/* Text + CTA */}
              {banner?.banner_title && (
                <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 md:px-20">
                  <p className="text-white/70 text-xs sm:text-sm font-medium tracking-widest uppercase mb-2">
                    FruitSnacks
                  </p>
                  <h2 className="text-white font-bold text-lg sm:text-2xl md:text-4xl leading-tight max-w-md mb-4 drop-shadow-sm">
                    {banner.banner_title}
                  </h2>
                  {banner?.banner_path && (
                    <Link
                      href={banner.banner_path}
                      className="inline-flex items-center gap-2 bg-primary text-white text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2 sm:py-2.5 hover:bg-primary-600 transition-colors w-fit"
                    >
                      Shop Now →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BannerItem;
