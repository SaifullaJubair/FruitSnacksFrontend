"use client";
import useGetSettingData from "@/components/lib/getSettingData";
import CustomLoader from "@/components/shared/loader/CustomLoader";
import { LoaderOverlay } from "@/components/shared/loader/LoaderOverlay";
import ProductSectionSkeleton from "@/components/shared/loader/ProductSectionSkeleton";

import { BASE_URL } from "@/components/utils/baseURL";
import { images } from "@/components/utils/ImageImport";
import { useUserInfoQuery } from "@/redux/feature/auth/authApi";
import { isHexColor, lineThroughPrice, productPrice } from "@/utils/helper";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaBoxArchive, FaHeart } from "react-icons/fa6";
import { GiFlameSpin } from "react-icons/gi";
import { IoCartOutline } from "react-icons/io5";
import { MdOutlineReviews } from "react-icons/md";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const [wishlistLength, setWishlistLength] = useState(0);
  const [productLength, setProductLength] = useState(0);
  const { products } = useSelector((state) => state.cart);
  const { data: settingsData } = useGetSettingData();
  const currencySymbol = settingsData?.data[0];

  //Cart And Wish List
  useEffect(() => {
    const updateWishlistAndCart = () => {
      try {
        const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        setWishlistLength(wishlist.length);

        // const productList = JSON.parse(localStorage.getItem("cart")) || [];
        // setProductLength(productList?.products?.length || 0);
      } catch (error) {
        console.error("Error reading data from localStorage", error);
      }
    };

    // Initial load
    updateWishlistAndCart();

    // Listen for 'storage' events (cross-tab/local updates)
    window.addEventListener("storage", updateWishlistAndCart);

    // Listen for custom events (intra-tab updates)
    window.addEventListener("localStorageUpdated", updateWishlistAndCart);

    return () => {
      window.removeEventListener("storage", updateWishlistAndCart);
      window.removeEventListener("localStorageUpdated", updateWishlistAndCart);
    };
  }, []);
  useEffect(() => {
    setProductLength(products?.length || 0);
  }, [products]);

  //Cart And Wish List

  //get User....
  const { data: userInfo, isLoading: userGetLoading } = useUserInfoQuery();
  const user_id = userInfo?.data?._id;

  //get Dashboard Data
  const { data: dasBoardData, isLoading } = useQuery({
    queryKey: [`/api/v1/get_me/dashboard_data?user_id=${user_id}`],
    queryFn: async () => {
      const res = await fetch(
        `${BASE_URL}/get_me/dashboard_data?user_id=${user_id}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      return data;
    },
  });
  // console.log(dasBoardData?.data?.trendingProduct?.totalData);
  // if (userGetLoading) {
  //   return <CustomLoader />;
  // }

  return (
    <div className="">
      <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 border p-6">
          <div className="w-[50px] h-[50px]  text-white bg-red-600 flex justify-center items-center">
            <IoCartOutline size={25} />
          </div>
          <div>
            <p className="font-bold lg:text-2xl">
              {" "}
              {productLength !== null && <> {productLength}</>}
            </p>
            <p>Products in Cart</p>
          </div>
        </div>
        <div className="flex items-center gap-4 border p-6">
          <div className="w-[50px] h-[50px]  text-white bg-blue-600 flex justify-center items-center">
            <FaHeart size={25} />
          </div>
          <div>
            <p className="font-bold lg:text-2xl">
              {" "}
              {wishlistLength !== null && <> {wishlistLength}</>}
            </p>
            <p>Products in Wishlist</p>
          </div>
        </div>
        <div className="flex items-center gap-4 border p-6">
          <div className="w-[50px] h-[50px]  text-white bg-green-400 flex justify-center items-center">
            <FaBoxArchive size={25} />
          </div>
          <div>
            <p className="font-bold lg:text-2xl">
              {dasBoardData?.data?.totalOrder}
            </p>
            <p>Total Products Ordered</p>
          </div>
        </div>
        <div className="flex items-center gap-4 border p-6">
          <div className="w-[50px] h-[50px]  text-white bg-orange-500 flex justify-center items-center">
            <GiFlameSpin size={25} />
          </div>
          <div>
            <p className="font-bold lg:text-2xl">
              {dasBoardData?.data?.totalOfferOrder}
            </p>
            <p>Total Offer Products Ordered</p>
          </div>
        </div>
        <div className="flex items-center gap-4 border p-6">
          <div className="w-[50px] h-[50px]  text-white bg-yellow-500 flex justify-center items-center">
            <MdOutlineReviews size={25} />
          </div>
          <div>
            <p className="font-bold lg:text-2xl">
              {dasBoardData?.data?.totalReview}
            </p>
            <p>Total Review</p>
          </div>
        </div>
      </div>

      {/* ----Trending Product---- */}

      {isLoading ? (
        <ProductSectionSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-y-6">
          {dasBoardData?.data?.trendingProduct?.data?.map((product, index) => (
            <Link
              href={`/products/${product?.product_slug}`}
              className="group block overflow-hidden"
              key={index}
            >
              <div className="relative aspect-[2/3] overflow-hidden">
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
                    src={
                      product?.main_image || "/assets/images/placeholder.jpg"
                    } // Fallback image
                    alt={product?.product_name || "Product Image"}
                    fill
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
      )}
    </div>
  );
};

export default Dashboard;
