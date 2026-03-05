"use client";

import { MdDeleteForever } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Contain from "../../common/Contain";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fetchCartDetails } from "@/utils/fetchCartDetails";
import { addToCart } from "@/redux/feature/cart/cartSlice";
import WishlistEmpty from "@/components/shared/wishListEmpty/WishListEmpty";
import useGetSettingData from "@/components/lib/getSettingData";
import { BiCart } from "react-icons/bi";
import { lineThroughPrice, productPrice } from "@/utils/helper";
import { PhotoProvider, PhotoView } from "react-photo-view";
import WishlistTableSkeleton from "@/components/shared/loader/WishlistTableSkeleton";
import { CART_QUERY_KEY } from "../cart/AddToCart";
import { useUserInfoQuery } from "@/redux/feature/auth/authApi";

// ✅ আগে ছিল: useMetaPixel + generateEventId + sendServerEvent + useGTM + useTikTokPixel + sendTikTokServerEvent
// ✅ এখন: একটাই hook
import useAnalytics from "@/components/analyticsScripts/utils/useAnalytics";

const WISHLIST_QUERY_KEY = "/api/v1/product/wishlist_product";

const WishList = () => {
  const [wishList, setWishList] = useState([]);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const cartProducts = useSelector((state) => state.cart.products);
  const { data: userInfo } = useUserInfoQuery();

  // ✅ একটাই hook
  const { trackAddToCart } = useAnalytics();

  useEffect(() => {
    try {
      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishList(wishlist);
    } catch (error) {
      console.error("Error reading wishlist from localStorage", error);
    }
  }, []);

  const { data: cartDetails, isLoading } = useQuery({
    queryKey: [
      WISHLIST_QUERY_KEY,
      wishList
        .map((w) => w.productId + (w.variation_product_id || ""))
        .join(","),
    ],
    queryFn: async () => await fetchCartDetails(wishList),
    enabled: wishList.length > 0,
    staleTime: Infinity,
  });

  const handleRemoveWishlist = (product) => {
    const wishListItem = {
      productId: product?._id,
      variation_product_id: product?.is_variation
        ? product?.variations?._id
        : null,
    };
    let existingWishlist = [];
    try {
      existingWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    } catch (error) {}
    const updatedWishlist = existingWishlist.filter(
      (item) =>
        item.productId !== wishListItem.productId ||
        item.variation_product_id !== wishListItem.variation_product_id,
    );
    setWishList(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event("localStorageUpdated"));
    toast.error("Product removed from your wishlist", { autoClose: 1500 });
  };

  const handleAddToCart = (product) => {
    const cartItem = {
      productId: product?._id,
      quantity: 1,
      variation_product_id: product?.is_variation
        ? product?.variations?._id
        : null,
    };

    const productID = cartProducts.find(
      (item) => item?.productId === product?._id,
    );
    if (product?.is_variation) {
      const variationID = cartProducts.find(
        (item) => item?.variation_product_id === product?.variations?._id,
      );
      if (productID && variationID) {
        toast.error("Already is added cart", { autoClose: 1500 });
        return;
      }
    } else if (productID) {
      toast.error("Already is added cart", { autoClose: 1500 });
      return;
    }

    dispatch(addToCart(cartItem));
    toast.success("Successfully added to cart", { autoClose: 1500 });
    queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY] });

    // ✅ AddToCart — Meta + TikTok + GTM একটাই call
    trackAddToCart(
      product,
      product?.is_variation ? product?.variations : null,
      1,
      {
        ph: userInfo?.data?.user_phone,
        fn: userInfo?.data?.user_name,
        external_id: userInfo?.data?._id,
      },
    );
  };

  const { data: settingsData } = useGetSettingData();
  const currencySymbol = settingsData?.data[0];

  if (!isLoading && !wishList?.length) return <WishlistEmpty />;

  return (
    <div className="min-h-screen bg-[#F4F4F4]/50">
      <PhotoProvider>
        <Contain>
          <div>
            <div className="pt-6">
              <h1 className="font-thin text-text-default">Your Wishlist</h1>
              {!isLoading && (
                <p className="font-thin text-text-default">
                  There are {wishList?.length} products in this list
                </p>
              )}
            </div>
          </div>
          {isLoading ? (
            <WishlistTableSkeleton />
          ) : (
            <div className="mt-6 bg-white shadow-lg">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="min-w-full text-sm">
                  <thead className="ltr:text-left rtl:text-right bg-gray-100">
                    <tr className="text-gray-900">
                      <td className="whitespace-nowrap p-4">#</td>
                      <td className="whitespace-nowrap p-4">Image</td>
                      <td className="whitespace-nowrap p-4">Product</td>
                      <td className="whitespace-nowrap p-4">Price</td>
                      <td className="whitespace-nowrap p-4">Stock Status</td>
                      <td className="whitespace-nowrap p-4">Action</td>
                      <td className="whitespace-nowrap p-4">Remove</td>
                    </tr>
                  </thead>
                  <tbody className="divide-gray-200">
                    {cartDetails?.data?.map((product, index) => (
                      <tr
                        className={`divide-y divide-gray-100 space-y-2 py-2 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                        key={`${product._id}-${product?.variations?._id || "no-var"}`}
                      >
                        <td className="whitespace-nowrap p-4">{index + 1}</td>
                        <td>
                          <PhotoView src={product?.main_image}>
                            <Image
                              src={product?.main_image}
                              className="w-20 h-[72px] cursor-zoom-in border"
                              height={100}
                              width={100}
                              alt={product?.product_name}
                            />
                          </PhotoView>
                        </td>
                        <td className="min-w-[260px] py-2.5 text-gray-700 px-4">
                          <div className="mt-1">
                            <p className="mb-1">
                              <Link
                                href={`/products/${product?.product_slug}`}
                                className="text-text-semiLight font-medium hover:text-primary line-clamp-2"
                              >
                                {product?.product_name}
                              </Link>
                            </p>
                            <div className="text-text-Lighter items-center">
                              {product?.brand_id?.brand_name && (
                                <p>Brand: {product?.brand_id?.brand_name}</p>
                              )}
                              {product?.is_variation && (
                                <p>
                                  Variations:{" "}
                                  {product?.variations?.variation_name}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap py-2.5 font-medium text-gray-700 px-4">
                          <div className="flex items-center justify-between space-x-2 mt-2">
                            <div>
                              <span className="text-base font-semibold">
                                {currencySymbol?.currency_symbol}
                                {productPrice(product)}
                              </span>
                              {lineThroughPrice(product) && (
                                <span className="text-sm ml-2 line-through text-gray-400">
                                  {currencySymbol?.currency_symbol}
                                  {lineThroughPrice(product)}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap py-1.5 font-medium text-gray-700 px-4">
                          {product?.is_variation ? (
                            product?.variations?.variation_quantity > 0 ? (
                              <button className="px-[10px] py-[4px] bg-green-100 cursor-auto">
                                In Stock
                              </button>
                            ) : (
                              <button className="px-[10px] py-[4px] bg-red-100 cursor-auto">
                                Out of Stock
                              </button>
                            )
                          ) : product?.product_quantity > 0 ? (
                            <button className="px-[10px] py-[4px] bg-green-100 cursor-auto">
                              In Stock
                            </button>
                          ) : (
                            <button className="px-[10px] py-[4px] bg-red-100 cursor-auto">
                              Out of Stock
                            </button>
                          )}
                        </td>
                        <td className="whitespace-nowrap py-2.5 font-medium text-gray-700 px-4">
                          {cartProducts?.some(
                            (cartItem) =>
                              cartItem.productId === product?._id &&
                              (!product?.is_variation ||
                                cartItem.variation_product_id ===
                                  product?.variations?._id),
                          ) ? (
                            <Button
                              variant="default"
                              size="sm"
                              className="cursor-not-allowed"
                              disabled
                            >
                              Already Added
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleAddToCart(product)}
                            >
                              <BiCart />
                              Add to Cart
                            </Button>
                          )}
                        </td>
                        <td className="whitespace-nowrap py-2.5 font-medium text-gray-700 px-4">
                          <button onClick={() => handleRemoveWishlist(product)}>
                            <MdDeleteForever
                              size={25}
                              className="cursor-pointer text-red-500 hover:text-red-300"
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Contain>
      </PhotoProvider>
    </div>
  );
};

export default WishList;
