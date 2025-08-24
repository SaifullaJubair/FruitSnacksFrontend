"use client";

import { FaAngleRight, FaStar } from "react-icons/fa";
import { FaStarHalfAlt } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import Contain from "../../common/Contain";

import Image from "next/image";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fetchCartDetails } from "@/utils/fetchCartDetails";
import { addToCart } from "@/redux/feature/cart/cartSlice";
import { useUserInfoQuery } from "@/redux/feature/auth/authApi";
import CustomLoader from "@/components/shared/loader/CustomLoader";
import WishlistEmpty from "@/components/shared/wishListEmpty/WishListEmpty";
import useGetSettingData from "@/components/lib/getSettingData";
import { lineThroughPrice, productPrice } from "@/utils/helper";
import { PhotoProvider, PhotoView } from "react-photo-view";

const UserDashboardWishList = () => {
  const [wishList, setWishList] = useState([]);

  const dispatch = useDispatch();
  const cartProducts = useSelector((state) => state.cart.products);
  const [isCartProduct, setIsCartProduct] = useState(false);
  useEffect(() => {
    try {
      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishList(wishlist);
    } catch (error) {
      console.error("Error reading wishlist from localStorage", error);
    }
  }, []);

  const {
    data: cartDetails,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["/api/v1/product/cart_product"],
    queryFn: async () => await fetchCartDetails(wishList),
  });

  useEffect(() => {
    refetch();
  }, [wishList, refetch]);

  const handleAddToCart = (product) => {
    const cartItem = {
      productId: product?._id,
      quantity: 1,
      variation_product_id: product?.is_variation
        ? product?.variations?._id
        : null,
    };
    const productID = cartProducts.find(
      (cartItem) => cartItem?.productId === product?._id
    );
    if (product?.is_variation) {
      const variationID = cartProducts.find(
        (cartItem) =>
          cartItem?.variation_product_id === product?.variations?._id
      );

      if (productID && variationID) {
        toast.error("Already is added cart", {
          autoClose: 1500,
        });
      } else {
        dispatch(addToCart(cartItem));
        toast.success("Successfully added to cart", {
          autoClose: 1500,
        });
      }
    } else if (productID) {
      toast.error("Already is added cart", {
        autoClose: 1500,
      });
    } else {
      dispatch(addToCart(cartItem));
      toast.success("Successfully added to cart", {
        autoClose: 1500,
      });
    }
    // dispatch(addToCart(cartItem));
    // toast.success("Successfully added to cart", {
    //   autoClose: 1500,
    // });
  };

  const handleRemoveWishlist = async (product) => {
    const wishListItem = {
      productId: product?._id,
      variation_product_id: product?.is_variation
        ? product?.variations?._id
        : null,
    };

    let existingWishlist = [];
    try {
      existingWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    } catch (error) {
      console.error("Error parsing wishlist from localStorage", error);
    }

    // Filter out the product
    const updatedWishlist = existingWishlist.filter(
      (item) =>
        item.productId !== wishListItem.productId ||
        item.variation_product_id !== wishListItem.variation_product_id
    );

    // Update Local State & LocalStorage
    setWishList(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event("localStorageUpdated"));
    // Refetch data to update `cartDetails`
    await refetch()
      .then(() => {
        toast.error("Product removed from your wishlist", {
          autoClose: 1500,
        });
      })
      .catch((error) => {
        console.error("Failed to refetch cart details:", error);
      });
  };
  const { data: settingsData, isLoading: siteSettingLoading } =
    useGetSettingData();

  const currencySymbol = settingsData?.data[0];
  if (isLoading) return <CustomLoader />;

  if (!wishList?.length) return <WishlistEmpty />;

  return (
    <div className="min-h-screen ">
      <PhotoProvider>
        <Contain>
          <div>
            <h4 className="bg-primary p-4 text-white sticky top-0 z-10">
              Your Wishlist
            </h4>
            <p className=" text-text-default text-lg mt-4">
              There are {wishList?.length} products in your wishlist
            </p>
          </div>
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-y-6">
          {cartDetails?.data?.map((product, index) => (
            <Link
              href={`/products/${product?.product_slug}`}
              key={index}
              className="bg-white   shadow-md border-primaryVariant-100 border h-96 "
            >
              <div className="relative p-2 group">
                {product.isNew && (
                  <span className="absolute top-0 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded-br-lg rounded-tl-lg">
                    New
                  </span>
                )}
                <Image
                  src={product?.main_image}
                  alt={product?.product_name}
                  width={400}
                  height={400}
                  className="w-full h-36 sm:h-44  object-cover group-hover:scale-105 transition-transform duration-300" // Hover effect
                />
              </div>
              <div className="p-3 flex flex-col justify-between h-40 sm:h-44 md:h-48">
                <p className="text-base sm:text-lg mt-2 text-text-default font-medium line-clamp-2">
                  {product?.product_name}
                </p>
                <p className="text-sm text-gray-500">
                  {product?.brand?.brand_name}
                </p>

                <div className="flex items-center text-xs sm:text-sm ">
                  {Array.from({ length: 5 }, (_, index) => {
                    if (product.rating > index) {
                      return (
                        <FaStar key={index} className="text-yellow-400 " />
                      );
                    }
                    return (
                      <FaStarHalfAlt key={index} className="text-yellow-400" />
                    );
                  })}
                  <span className="ml-2  text-gray-500">({117} )</span>
                </div>
                <div>
                  <p>
                    {product?.is_variation &&
                      `Variation:
                     ${product?.variations?.variation_name}`}
                  </p>
                </div>

                <div className="flex items-center justify-between space-x-2 mt-2">
                  <div>
                    <span className="text-lg font-semibold">
                      $
                      {product?.flash_sale_details
                        ? product?.flash_sale_details?.flash_sale_product
                            ?.flash_sale_product_price
                        : product?.campaign_details
                        ? product?.campaign_details?.campaign_product
                            ?.campaign_product_price
                        : product?.is_variation
                        ? product?.variations?.variation_discount_price
                          ? product?.variations?.variation_discount_price
                          : product?.variations?.variation_price
                        : product?.product_discount_price
                        ? product?.product_discount_price
                        : product?.product_price}
                    </span>
                    {product?.variations?.variation_price ? (
                      <span className="text-sm ml-2 line-through text-gray-400">
                        $ {product?.variations?.variation_price}
                      </span>
                    ) : (
                      <span className="text-sm ml-2 line-through text-gray-400">
                        $ {product?.product_price}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <Button
                    className="bg-red-500 text-white px-4 py-2 rounded"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveWishlist(product);
                    }}
                  >
                    <MdDeleteForever className="inline-block mr-1" />{" "}
                    <span className="hidden md:flex">Remove</span>
                  </Button>
                  {cartProducts?.some(
                    (cartItem) =>
                      cartItem.productId === product?._id &&
                      (!product?.is_variation ||
                        cartItem.variation_product_id ===
                          product?.variations?._id)
                  ) ? (
                    <Button
                      className="cursor-not-allowed px-4 py-2 rounded"
                      variant="default"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      Already Added
                    </Button>
                  ) : (
                    <Button
                      className=""
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                    >
                      Add to Cart
                    </Button>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div> */}

          <div className="mt-6 bg-white shadow-lg">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="min-w-full text-sm">
                <thead className="ltr:text-left rtl:text-right bg-gray-200">
                  <tr className="text-gray-900 ">
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
                      key={index}
                    >
                      <td className="whitespace-nowrap p-4 ">
                        {/* <input type="checkbox" id="" name="" value="" /> */}{" "}
                        {index + 1}
                      </td>
                      <td>
                        <PhotoView src={product?.main_image}>
                          <Image
                            src={product?.main_image}
                            className="w-20 h-[72px]  cursor-zoom-in  border"
                            height={100}
                            width={100}
                            alt=""
                          />
                        </PhotoView>
                      </td>
                      <td className="min-w-[260px] py-2.5 text-gray-700  px-4  scrollbar-track-gray-200">
                        <div className="mt-1 ">
                          <p className="mb-1">
                            <Link
                              href={`/products/${product?.product_slug}`}
                              className="text-text-semiLight font-medium hover:text-primary line-clamp-2"
                            >
                              {product?.product_name}
                            </Link>
                          </p>
                          <div className="text-text-Lighter items-center">
                            <p>Brand: {product?.brand_id?.brand_name}</p>
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
                        {/* <span className="text-2xl font-thin">
                        {currencySymbol}
                        {product?.flash_sale_details
                          ? product?.flash_sale_details?.flash_sale_product
                              ?.flash_sale_product_price
                          : product?.campaign_details
                          ? product?.campaign_details?.campaign_product
                              ?.campaign_product_price
                          : product?.is_variation
                          ? product?.variations?.variation_discount_price
                            ? product?.variations?.variation_discount_price
                            : product?.variations?.variation_price
                          : product?.product_discount_price
                          ? product?.product_discount_price
                          : product?.product_price}
                      </span>
                      {product?.variations?.variation_price ? (
                        <span className="text-sm ml-2 line-through text-gray-400">
                          {currencySymbol}{" "}
                          {product?.variations?.variation_price}
                        </span>
                      ) : (
                        <span className="text-sm ml-2 line-through text-gray-400">
                          {currencySymbol} {product?.product_price}
                        </span>
                      )} */}

                        <div>
                          <span className="text-base font-semibold">
                            {" "}
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
                      </td>
                      <td className="whitespace-nowrap py-1.5 font-medium text-gray-700 px-4">
                        {product?.is_variation ? (
                          product?.variations?.variation_quantity > 0 ? (
                            <button className=" px-[10px] py-[4px]  bg-green-100 text-red">
                              In Stock
                            </button>
                          ) : (
                            <button className=" px-[10px] py-[4px]  bg-red-100 text-red">
                              Out of Stock
                            </button>
                          )
                        ) : product?.product_quantity > 0 ? (
                          <button className=" px-[10px] py-[4px]  bg-green-100 text-red">
                            In Stock
                          </button>
                        ) : (
                          <button className=" px-[10px] py-[4px]  bg-red-100 text-red">
                            Out of Stock
                          </button>
                        )}
                      </td>

                      <td className="whitespace-nowrap py-2.5 font-medium text-gray-700 px-4">
                        {cartProducts.some(
                          (cartItem) =>
                            cartItem.productId === product?._id &&
                            (!product?.is_variation ||
                              cartItem.variation_product_id ===
                                product?.variations?._id)
                        ) ? (
                          <Button className="" variant="default" disabled>
                            Already Added
                          </Button>
                        ) : (
                          <Button
                            className=""
                            variant="light"
                            onClick={() => handleAddToCart(product)}
                          >
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
        </Contain>
      </PhotoProvider>
    </div>
  );
};

export default UserDashboardWishList;
