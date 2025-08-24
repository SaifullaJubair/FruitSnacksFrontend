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
import WishlistEmpty from "@/components/shared/wishListEmpty/WishListEmpty";
import useGetSettingData from "@/components/lib/getSettingData";
import { BiCart } from "react-icons/bi";
import { lineThroughPrice, productPrice } from "@/utils/helper";
import { PhotoProvider, PhotoView } from "react-photo-view";
import WishlistTableSkeleton from "@/components/shared/loader/WishlistTableSkeleton";

const WishList = () => {
  const [wishList, setWishList] = useState([]);
  const dispatch = useDispatch();
  const cartProducts = useSelector((state) => state.cart.products);
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
    if (cartDetails?.data?.length) {
      setWishList((prevWishlist) => {
        const updatedWishlist = prevWishlist.filter((wishItem) => {
          return cartDetails?.data?.some((cartItem) => {
            if (wishItem?.variation_product_id) {
              // Match productId and variation ID
              return (
                cartItem?._id === wishItem?.productId &&
                cartItem?.variations?._id === wishItem?.variation_product_id
              );
            } else {
              // Match only productId if no variation
              return cartItem?._id === wishItem?.productId;
            }
          });
        });

        // Update localStorage if wishlist changes
        if (JSON.stringify(updatedWishlist) !== JSON.stringify(prevWishlist)) {
          localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
          window.dispatchEvent(new Event("localStorageUpdated"));
        }

        return updatedWishlist;
      });
    }
  }, [cartDetails]);

  // console.log(wishList);

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
  // console.log(wishList.length);

  // if (!isLoading) return <WishlistTableSkeleton />;

  if (!isLoading && !wishList?.length) return <WishlistEmpty />;

  return (
    <div className="min-h-screen  bg-[#F4F4F4]/50">
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
            <>
              <WishlistTableSkeleton />
            </>
          ) : (
            <div className="mt-6 bg-white shadow-lg">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="min-w-full text-sm">
                  <thead className="ltr:text-left rtl:text-right bg-gray-100">
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
                          </div>
                        </td>
                        <td className="whitespace-nowrap py-1.5 font-medium text-gray-700 px-4">
                          {product?.is_variation ? (
                            product?.variations?.variation_quantity > 0 ? (
                              <button className=" px-[10px] py-[4px]  bg-green-100 text-red cursor-auto">
                                In Stock
                              </button>
                            ) : (
                              <button className=" px-[10px] py-[4px]  bg-red-100 text-red cursor-auto">
                                Out of Stock
                              </button>
                            )
                          ) : product?.product_quantity > 0 ? (
                            <button className=" px-[10px] py-[4px]  bg-green-100 text-red cursor-auto">
                              In Stock
                            </button>
                          ) : (
                            <button className=" px-[10px] py-[4px]  bg-red-100 text-red cursor-auto">
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
                                  product?.variations?._id)
                          ) ? (
                            <Button
                              className=""
                              variant="default"
                              size="sm"
                              disabled
                            >
                              Already Added
                            </Button>
                          ) : (
                            <Button
                              className=""
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
