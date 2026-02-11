"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { productPrice, lineThroughPrice } from "@/utils/helper";
import { BASE_URL } from "@/components/utils/baseURL";
import useGetSettingData from "@/components/lib/getSettingData";

const CategoryWiseProduct = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          // `http://localhost:5000/api/v1/product/just_for_you_product`
          `${BASE_URL}/product/just_for_you_product`,
        );
        const result = await response.json();
        setData(result?.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-96 bg-gray-100 animate-pulse"></div>;

  return (
    <div className="max-w-[98%] mx-auto px-4 py-4 sm:py-8">
      {data?.map((categoryGroup, index) => (
        <div
          key={index}
          className="grid grid-cols-2 sm:grid-cols-4 grid-rows-2 gap-4 mb-4 md:mb-12"
        >
          {/* Left 2 Columns - Category (Spanning 2 rows) */}
          {categoryGroup?.categoryDetails && (
            <div className="col-span-2 row-span-2 relative group overflow-hidden  w-full aspect-[2/3]">
              <Link
                href={`/category/${categoryGroup?.categoryDetails?.category_slug}`}
              >
                <Image
                  src={categoryGroup?.categoryDetails?.category_logo}
                  alt={categoryGroup?.categoryDetails?.category_name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center p-8 text-center">
                  <h3 className="text-3xl font-bold text-white mb-4">
                    {categoryGroup?.categoryDetails?.category_name}
                  </h3>
                  <p className="text-white text-lg mb-6">
                    Explore our premium collection
                  </p>
                  <button className="bg-white text-gray-900 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition">
                    Shop Now
                  </button>
                </div>
              </Link>
            </div>
          )}

          {/* Right 2 Columns - Products */}

          {/* First Row - Left to Right Swiper */}
          <div className="col-span-2 row-span-1 relative">
            <Swiper
              modules={[Navigation, Autoplay]}
              slidesPerView={2}
              spaceBetween={20}
              navigation={{
                nextEl: `.next-slide-${index}`,
                prevEl: `.prev-slide-${index}`,
              }}
              autoplay={{
                delay: 4500,
                disableOnInteraction: false,
              }}
              loop={true}
              className="h-full"
            >
              {categoryGroup.products.map((product) => (
                <SwiperSlide key={product._id} className="h-full">
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
            <button
              className={`prev-slide-${index} absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition-all duration-300 transform -translate-x-1/2`}
            >
              <FaAngleLeft className="text-lg" />
            </button>
            <button
              className={`next-slide-${index} absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition-all duration-300 transform translate-x-1/2`}
            >
              <FaAngleRight className="text-lg" />
            </button>
          </div>

          {/* Second Row - Right to Left Swiper */}
          <div className="col-span-2 row-span-1 relative">
            <Swiper
              modules={[Navigation, Autoplay]}
              slidesPerView={2}
              spaceBetween={20}
              navigation={{
                nextEl: `.next-slide-reverse-${index}`,
                prevEl: `.prev-slide-reverse-${index}`,
              }}
              autoplay={{
                delay: 4500,
                disableOnInteraction: false,
                reverseDirection: true,
              }}
              loop={true}
              className="h-full"
            >
              {[...categoryGroup.products].reverse().map((product) => (
                <SwiperSlide key={product._id} className="h-full">
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
            <button
              className={`prev-slide-reverse-${index} absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition-all duration-300 transform -translate-x-1/2`}
            >
              <FaAngleLeft className="text-lg" />
            </button>
            <button
              className={`next-slide-reverse-${index} absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition-all duration-300 transform translate-x-1/2`}
            >
              <FaAngleRight className="text-lg" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const ProductCard = ({ product }) => {
  const { data: settingsData } = useGetSettingData();
  const currencySymbol = settingsData?.data[0];
  return (
    <div className="bg-white shadow-md hover:shadow-xl transition-shadow duration-300  overflow-hidden h-full aspect-[2/3]">
      <Link
        href={`/products/${product.product_slug}`}
        className="block h-full relative"
      >
        {/* Product Image/Video */}
        <div className="absolute inset-0">
          {product.main_video ? (
            <video
              autoPlay
              loop
              muted
              className="w-full h-full object-cover"
              src={product.main_video}
            />
          ) : (
            <Image
              src={product.main_image || "/placeholder.jpg"}
              alt={product.product_name}
              fill
              className="object-cover"
            />
          )}
        </div>

        {/* Product Info Overlay */}
        <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center p-4 text-center opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/90 p-2 md:p-4  max-w-[90%]">
            <h3 className="text-sm lg:text-lg font-bold text-gray-800">
              {product.product_name}
            </h3>
            <div className="mt-2">
              <span className="lg:text-lg font-bold text-primary">
                {currencySymbol?.currency_symbol}

                {productPrice(product)}
              </span>
              {lineThroughPrice(product) && (
                <span className="text-xs lg:text-sm ml-1 line-through text-gray-500">
                  {currencySymbol?.currency_symbol}

                  {lineThroughPrice(product)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CategoryWiseProduct;
