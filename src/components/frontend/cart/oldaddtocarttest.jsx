// "use client";

// import { FaAngleRight, FaLock, FaStar } from "react-icons/fa";
// import { FaStarHalfAlt } from "react-icons/fa";
// import { MdDeleteForever } from "react-icons/md";
// import { useDispatch, useSelector } from "react-redux";
// import { useQuery } from "@tanstack/react-query";
// import Contain from "../../common/Contain";
// import qs from "qs";
// import { BASE_URL } from "@/components/utils/baseURL";
// import Image from "next/image";

// import { useEffect, useMemo, useState } from "react";
// import { toast } from "react-toastify";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { fetchCartDetails } from "@/utils/fetchCartDetails";
// import CartTable from "./CartTable";
// import useGetSettingData from "@/components/lib/getSettingData";
// import { useUserInfoQuery } from "@/redux/feature/auth/authApi";
// import { set } from "react-hook-form";

// const AddToCart = () => {
//   const { products, totalQuantity } = useSelector((state) => state.cart);
//   const { data: settingData, isLoading: settingLoading } = useGetSettingData();
//   const { data: userInfo, isLoading: userGetLoading } = useUserInfoQuery();
//   const [location, setLocation] = useState("Inside Dhaka");
//   const [shopSubtotals, setShopSubtotals] = useState({});
//   const [shopGrandTotals, setShopGrandTotals] = useState({});
//   const [totalDiscount, setTotalDiscount] = useState(0);
//   const [grandTotal, setGrandTotal] = useState(0);
//   const [subtotal, setSubtotal] = useState(0);
//   const [couponProductPrice, setCouponProductPrice] = useState(0);
//   // Will be Change
//   const [adjustedPrices, setAdjustedPrices] = useState({});
//   const [couponData, setCouponData] = useState(null);
//   const [couponCode, setCouponCode] = useState("");
//   const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
//   const [panelOwnerId, setPanelOwnerId] = useState(null);
//   console.log(panelOwnerId);

//   // State for initial fetch
//   const [shouldFetch, setShouldFetch] = useState(true);

//   // Fetch Cart Details
//   const {
//     data: cartDetails,
//     isLoading,
//     refetch,
//   } = useQuery({
//     queryKey: ["/api/v1/product/cart_product"],
//     queryFn: async () => await fetchCartDetails(products),
//     enabled: shouldFetch && products.length > 0,
//     onSuccess: () => setShouldFetch(false),
//   });

//   console.log("CartProduct:", cartDetails);
//   // Transform Cart Data
//   const transformCartData = (cartData) => {
//     return cartData?.reduce((acc, item) => {
//       const {
//         shop_id = "default_shop_id",
//         panel_owner_id = "default_panel_owner_id",
//         shop_name,
//         shop_logo,
//         ...product
//       } = item;
//       const shop = acc?.find((s) => s?.panel_owner_id === panel_owner_id);
//       if (shop) {
//         shop?.products?.push(product);
//       } else {
//         acc?.push({
//           shop_id,
//           shop_name,
//           shop_logo,
//           panel_owner_id,
//           products: [product],
//         });
//       }
//       return acc;
//     }, []);
//   };

//   // Memoize formatted cart data to prevent unnecessary recalculations
//   const formattedCartData = useMemo(
//     () => transformCartData(cartDetails?.data),
//     [cartDetails?.data]
//   );

//   console.log(formattedCartData);

//   const productPrice = (product) => {
//     if (product?.flash_sale_details) {
//       return product?.flash_sale_details?.flash_sale_product
//         ?.flash_sale_product_price;
//     } else if (product?.campaign_details) {
//       return product?.campaign_details?.campaign_product
//         ?.campaign_product_price;
//     } else if (product?.variations) {
//       return product?.variations?.variation_discount_price
//         ? product?.variations?.variation_discount_price
//         : product?.variations?.variation_price;
//     } else {
//       return product?.product_discount_price
//         ? product?.product_discount_price
//         : product?.product_price;
//     }
//   };

//   const calculateSubtotal = (product) => {
//     const price = productPrice(product);

//     const quantity = products?.find(
//       (item) =>
//         item?.productId === product?._id &&
//         (product?.variations?._id
//           ? item?.variation_product_id === product?.variations?._id
//           : true)
//     )?.quantity;

//     return price * (quantity || 1);
//   };
//   const calculateProductSubtotal = (product) => {
//     const price =
//       couponData?.coupon_product_type === "specific" &&
//       couponData?.coupon_specific_product?.some(
//         (item) => item?.product_id === product?._id
//       )
//         ? calculationCouponProductPrice(productPrice(product))
//         : productPrice(product);

//     const quantity = products?.find(
//       (item) =>
//         item?.productId === product?._id &&
//         (product?.variations?._id
//           ? item?.variation_product_id === product?.variations?._id
//           : true)
//     )?.quantity;

//     return price * (quantity || 1);
//   };
// const calculateGrandTotal = (subtotals) => {
//   const total = Object.values(subtotals).reduce(
//     (acc, subTotal) => acc + subTotal,
//     0
//   );
//   return total + shippingCharge;
// };
//   const calculateShopSubtotalUsingCoupon = (subTotal) => {
//     if (
//       couponData?.coupon_product_type === "all" &&
//       couponData?.coupon_type === "percent"
//     ) {
//       const discountAmount = Math.round(
//         (subTotal * couponData?.coupon_amount) / 100
//       );
//       if (discountAmount > couponData?.coupon_max_amount) {
//         return subTotal - couponData?.coupon_max_amount;
//       }
//       return (
//         subTotal - Math.round(discountAmount, couponData?.coupon_max_amount)
//       );
//     } else if (
//       couponData?.coupon_product_type === "all" &&
//       couponData?.coupon_type === "fixed"
//     ) {
//       return subTotal - couponData?.coupon_amount;
//     }

//     return subTotal;
//   };

//   const calculateShopSubtotals = () => {
//     const subtotals = {};
//     formattedCartData?.forEach((shopProduct) => {
//       const subTotal = shopProduct?.products?.reduce(
//         (acc, product) => acc + calculateSubtotal(product),
//         0
//       );
//       subtotals[shopProduct?.panel_owner_id] = subTotal;
//     });
//     return subtotals;
//   };
//   const calculateProductShopSubtotals = () => {
//     const subtotals = {};
//     formattedCartData?.forEach((shopProduct) => {
//       const subTotal = shopProduct?.products?.reduce(
//         (acc, product) => acc + calculateProductSubtotal(product),
//         0
//       );
//       subtotals[shopProduct?.panel_owner_id] = subTotal;
//     });
//     return subtotals;
//   };

//   const calculateShopGrandTotals = (subtotals) => {
//     const grandTotals = {};
//     Object.keys(subtotals).forEach((panelOwnerId) => {
//       if (panelOwnerId === couponData?.panel_owner_id) {
//         grandTotals[panelOwnerId] = calculateShopSubtotalUsingCoupon(
//           subtotals[panelOwnerId]
//         );
//       } else {
//         grandTotals[panelOwnerId] = subtotals[panelOwnerId];
//       }
//     });
//     return grandTotals;
//   };

//   // Coupon Type Specific Calculation
//   const calculationCouponProductPrice = (price) => {
//     if (
//       couponData?.coupon_product_type === "specific" &&
//       couponData?.coupon_type === "percentage"
//     ) {
//       const discountPrice = Math.round(
//         (price * couponData?.coupon_amount) / 100
//       );
//       if (discountPrice > couponData?.coupon_max_amount) {
//         return price - couponData?.coupon_max_amount;
//       }
//       return price - discountPrice;
//     } else if (
//       couponData?.coupon_product_type === "specific" &&
//       couponData?.coupon_type === "fixed"
//     ) {
//       return price - couponData?.coupon_amount;
//     }
//     return price;
//   };

//   const shippingCharge =
//     location === "Inside Dhaka"
//       ? settingData?.data?.[0]?.inside_dhaka_shipping_charge || 0
//       : settingData?.data?.[0]?.outside_dhaka_shipping_charge || 0;

//   // ------**********-----------//

//   useEffect(() => {
//     const subtotals = calculateShopSubtotals();
//     setShopSubtotals(subtotals);
//     const grandTotals =
//       couponData?.coupon_product_type === "specific"
//         ? calculateShopGrandTotals(calculateProductShopSubtotals())
//         : calculateShopGrandTotals(subtotals);
//     setShopGrandTotals(grandTotals);
//     setSubtotal(
//       Object.values(subtotals).reduce((acc, subTotal) => acc + subTotal, 0)
//     );
//     setGrandTotal(
//       Object.values(grandTotals).reduce(
//         (acc, grandTotal) => acc + grandTotal,
//         0
//       ) + shippingCharge
//     );
//     setTotalDiscount(
//       Object.values(subtotals).reduce(
//         (acc, subTotal, index) =>
//           acc + (subTotal - Object.values(grandTotals)[index]),
//         0
//       )
//     );
//     // Calculate adjusted prices for coupon products
//     const newAdjustedPrices = {};
//     formattedCartData?.forEach((shopProduct) =>
//       shopProduct?.products?.forEach((product) => {
//         const price = productPrice(product);
//         newAdjustedPrices[product._id] = calculationCouponProductPrice(price);
//       })
//     );
//     setAdjustedPrices(newAdjustedPrices);
//   }, [couponData, formattedCartData, shippingCharge, products]);

//   // Set Coupon Data from Session Storage
//   useEffect(() => {
//     const sessionCouponData = JSON.parse(
//       sessionStorage.getItem("sessionCouponData")
//     );
//     const sessionDate = sessionStorage.getItem("sessionDate");
//     const currentDate = new Date().toISOString().split("T")[0];
//     if (sessionDate !== currentDate) {
//       sessionStorage.removeItem("sessionCouponData");
//       sessionStorage.removeItem("sessionDate");
//     } else {
//       setCouponData(sessionCouponData);
//     }
//     setCouponData(sessionCouponData);
//   }, []);

//   // Toggle Input
//   const handleShowCouponInput = (id) => {
//     setPanelOwnerId((prevPanelOwnerId) =>
//       prevPanelOwnerId === id ? null : id
//     );
//   };

//   // Apply Coupon Post Request
//   const handleApplyCoupon = async (panel_owner_id) => {
//     if (!couponCode.trim()) {
//       toast.error("Please enter a valid coupon code.");
//       return;
//     }

//     setIsApplyingCoupon(true);
//     try {
//       const response = await fetch(`${BASE_URL}/coupon/check_coupon`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           coupon_code: couponCode,
//           customer_id: userInfo?.data?._id,
//           panel_owner_id,
//         }),
//       });

//       const data = await response.json();
//       // if (response.ok) {
//       //   toast.success("Coupon applied successfully!");
//       //   const couponProductIndex = couponData?.findIndex(
//       //     (item) => item?.panel_owner_id === panel_owner_id
//       //   );
//       //   let updatedCouponData = [...couponData];
//       //   if (couponProductIndex !== -1) {
//       //     updatedCouponData.splice(couponProductIndex, 1);
//       //   }
//       //   updatedCouponData = [...updatedCouponData, data.data];
//       //   sessionStorage.setItem(
//       //     "sessionCouponData",
//       //     JSON.stringify(updatedCouponData)
//       //   );
//       //   setCouponData(updatedCouponData);
//       // }
//       if (response.ok) {
//         toast.success("Coupon applied successfully!");
//         sessionStorage.setItem("sessionCouponData", JSON.stringify(data?.data));
//         sessionStorage.setItem(
//           "sessionDate",
//           new Date().toISOString().split("T")[0]
//         );
//         setCouponData(data?.data);
//       } else {
//         toast.error(data.message || "Failed to apply coupon.");
//       }
//     } catch (error) {
//       toast.error("An error occurred while applying the coupon.");
//     } finally {
//       setIsApplyingCoupon(false);
//     }
//   };
//   // const coupon = couponData?.some(
//   //   (c) => c?.coupon_product_type === "specific"
//   // );
//   //  const coupon = couponData?.find(
//   //    (coupon) => coupon?.panel_owner_id === panelOwnerId
//   //  );
//   const handleOrderProduct = () => {
//     const today = new Date().toISOString().split("T")[0];
//     const shopProducts = formattedCartData?.map((shop) => {
//       const shopSubTotal = shopSubtotals[shop?.panel_owner_id];
//       const shopGrandTotal = shopGrandTotals[shop?.panel_owner_id];
//       const shopDiscount = shopSubTotal - shopGrandTotal;
//       const shopCoupon =
//         couponData?.panel_owner_id === shop?.panel_owner_id
//           ? couponData?._id
//           : null;
//       // const shopCoupon = couponData?.find(
//       //   (coupon) => coupon?.panel_owner_id === shop?.panel_owner_id
//       // );

//       return {
//         panel_owner_id: shop?.panel_owner_id,
//         shop_id: shop?.shop_id,
//         shop_name: shop?.shop_name,
//         sub_total_amount: shopSubTotal,
//         discount_amount: shopDiscount,
//         grand_total_amount: shopGrandTotal,
//         coupon_id: shopCoupon,
//         order_products: shop?.products.map((product) => {
//           const productQuantity = products.find(
//             (item) =>
//               item?.productId === product?._id &&
//               (product?.variations?._id
//                 ? item?.variation_product_id === product?.variations?._id
//                 : true)
//           )?.quantity;

//           return {
//             product_id: product._id,
//             product_name: product?.product_name,
//             main_image: product?.main_image,
//             brand: product?.brand_id?.brand_name || "",
//             variation_id: product.variations?._id || null,
//             product_unit_price: productPrice(product),
//             product_unit_final_price: adjustedPrices[product?._id],
//             product_quantity: productQuantity,
//             product_grand_total_price:
//               adjustedPrices[product?._id] * productQuantity,
//             campaign_id: product?.campaign_details?._id || null,
//           };
//         }),
//       };
//     });

//     const sendData = {
//       order_status: "pending",
//       pending_time: today,
//       sub_total_amount: subtotal,
//       shipping_cost: shippingCharge,
//       discount_amount: totalDiscount || 0,
//       grand_total_amount: grandTotal,
//       shipping_location: location,
//       billing_city: "",
//       billing_state: "",
//       billing_address: "",
//       customer_id: userInfo?.data?._id,
//       customer_phone: userInfo?.data?.user_phone || "",
//       shop_products: shopProducts,
//     };

//     sessionStorage.setItem("order_info", JSON.stringify(sendData));
//   };

//   console.log(formattedCartData);

//   if (isLoading || settingLoading || userGetLoading) return <p>Loading...</p>;

//   if (!products?.length) return <p>Your cart is empty</p>;
//   return (
//     <div className="min-h-screen  bg-[#F4F4F4]/50">
//       <Contain>
//         <div>
//           <div className="pt-6">
//             <h1 className="font-thin text-text-default">Your Cart</h1>
//             <p className="font-thin text-text-default">
//               There are {products?.length} products in this list
//             </p>
//           </div>
//         </div>
//         <div className="flex  gap-4 ">
//           <div className="flex gap-6 w-3/4 mt-4 overflow-x-auto">
//             <div className=" w-full space-y-6 ">
//               {formattedCartData?.map((shopProduct, i) => (
//                 <div className="my-2 py-2 bg-white  w-full" key={i}>
//                   <div className="whitespace-nowrap gap-3 flex items-center border-b py-3.5 px-4">
//                     {/* <input type="checkbox" id="" name="" value="" /> */}
//                     <img
//                       src={shopProduct?.shop_logo}
//                       className="w-6 h-6"
//                       alt=""
//                     />
//                     <p className="text-lg font-medium text-text-default">
//                       {shopProduct?.shop_name}
//                     </p>
//                     <FaAngleRight />
//                   </div>
//                   <div className="overflow-x-auto mx-4">
//                     <CartTable
//                       shopProduct={shopProduct}
//                       refetch={refetch}
//                       products={products}
//                       couponData={couponData}
//                       calculateSubtotal={calculateProductSubtotal}
//                       setCouponProductPrice={setCouponProductPrice}
//                       couponProductPrice={couponProductPrice}
//                       adjustedPrices={adjustedPrices}
//                       setAdjustedPrices={setAdjustedPrices}
//                       calculationCouponProductPrice={
//                         calculationCouponProductPrice
//                       }
//                     />
//                   </div>
//                   <hr className="my-2" />
//                   {/* Apply Coupon */}
//                   <div>
//                     {/* Apply Coupon */}
//                     {userInfo?.data?._id ? (
//                       <div className="max-w-sm ml-auto sm:mr-8 mr-4">
//                         <div className="flex justify-between items-center mt-4">
//                           <p className="text-text-Lighter">Apply Coupon</p>
//                           <button
//                             className="text-primary hover:underline"
//                             onClick={() =>
//                               handleShowCouponInput(shopProduct?.panel_owner_id)
//                             }
//                           >
//                             {panelOwnerId === shopProduct?.panel_owner_id
//                               ? "Cancel"
//                               : "Enter Your Coupon"}
//                           </button>
//                         </div>

//                         {/* Coupon Input */}
//                         <div
//                           className={`transition-all duration-500 overflow-hidden ${
//                             panelOwnerId === shopProduct?.panel_owner_id
//                               ? "max-h-40 mt-2"
//                               : "max-h-0"
//                           }`}
//                         >
//                           <div className="flex mt-2 gap-2">
//                             <input
//                               type="text"
//                               name="coupon"
//                               id="coupon"
//                               placeholder="Coupon Code"
//                               onChange={(e) => setCouponCode(e.target.value)}
//                               className="w-full p-2 border  "
//                             />
//                             <button
//                               className="bg-primary text-white px-4 py-2  "
//                               onClick={() =>
//                                 handleApplyCoupon(shopProduct?.panel_owner_id)
//                               }
//                               disabled={isApplyingCoupon}
//                             >
//                               {isApplyingCoupon ? "Applying..." : "Apply"}
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     ) : (
//                       <div>
//                         <div className=" flex items-center justify-end  text-text-Lightest mr-16">
//                           <Link href={"/sign-in"}>
//                             <Button
//                               size="sm"
//                               variant="link"
//                               className="text-text-Lighter text-base hover:text-blue-500 "
//                             >
//                               {" "}
//                               <FaLock /> Login
//                             </Button>{" "}
//                           </Link>
//                           <p> for Apply Coupon</p>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                   {/* Shop subtotal And GrandTotal */}
//                   {shopProduct?.panel_owner_id ===
//                   couponData?.panel_owner_id ? (
//                     <div>
//                       <div className="max-w-sm ml-auto sm:mr-8 mr-4">
//                         <div className="flex justify-between items-center mt-4">
//                           <p className="text-text-Lighter">Shop SubTotal: </p>
//                           <p className="text-text-Lighter">
//                             ৳ {shopSubtotals[shopProduct?.panel_owner_id] || 0}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="max-w-sm ml-auto sm:mr-8 mr-4">
//                         <div className="flex justify-between items-center mt-4">
//                           <p className="text-text-Lighter">
//                             Shop Discount Amount:{" "}
//                           </p>
//                           <p className="text-text-Lighter">
//                             ৳ -{" "}
//                             {shopSubtotals[shopProduct?.panel_owner_id] -
//                               shopGrandTotals[shopProduct?.panel_owner_id]}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="max-w-sm ml-auto sm:mr-8 mr-4">
//                         <div className="flex justify-between items-center mt-4">
//                           <p className="text-text-Lighter">Shop Grandtotal: </p>
//                           <p className="text-text-Lighter">
//                             ৳{" "}
//                             {shopGrandTotals[shopProduct?.panel_owner_id] || 0}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   ) : (
//                     <div>
//                       <div className="max-w-sm ml-auto sm:mr-8 mr-4">
//                         <div className="flex justify-between items-center mt-4">
//                           <p className="text-text-Lighter">Shop SubTotal: </p>
//                           <p className="text-text-Lighter">
//                             ৳ {shopSubtotals[shopProduct?.panel_owner_id] || 0}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="max-w-sm ml-auto sm:mr-8 mr-4">
//                         <div className="flex justify-between items-center mt-4">
//                           <p className="text-text-Lighter">
//                             Shop Discount Amount:{" "}
//                           </p>
//                           <p className="text-text-Lighter">৳ - 0</p>
//                         </div>
//                       </div>
//                       <div className="max-w-sm ml-auto sm:mr-8 mr-4">
//                         <div className="flex justify-between items-center mt-4">
//                           <p className="text-text-Lighter">Shop Grandtotal: </p>
//                           <p className="text-text-Lighter">
//                             ৳ {shopGrandTotals[shopProduct?.panel_owner_id]}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//           {/*All shop  subtotal and grand total  part */}
//           <div className="w-1/4">
//             <div className="  mt-6  bg-white shadow-lg p-4 ">
//               <div className="flex justify-between items-center">
//                 <p className="text-text-Lightest">Location</p>
//                 <select
//                   name="location"
//                   id="location"
//                   className="text-text-Lighter outline-none   p-1"
//                   onChange={(e) => setLocation(e.target.value)}
//                   value={location}
//                 >
//                   <option value="Inside Dhaka">Inside Dhaka</option>
//                   <option value="Outside Dhaka">Outside Dhaka</option>
//                 </select>
//               </div>

//               <hr />

//               {/* <div className="flex justify-between  mt-4">
//                 <p className="text-text-Lightest">Subtotal</p>
//                 <p className="text-text-Lightest">৳ {calculateGrandTotal()}</p>
//               </div> */}
//               <div className="flex justify-between  mt-4">
//                 <p className="text-text-Lightest">Subtotal</p>
//                 <p className="text-text-Lightest">৳ {subtotal}</p>
//               </div>

//               <hr className="mt-1" />
//               <div className="flex justify-between mt-4">
//                 <p className="text-text-Lightest">Total Discount</p>
//                 <p className="text-text-Lightest">৳ -{totalDiscount}</p>
//               </div>
//               <hr className="mt-1" />
//               <div className="flex justify-between  mt-4">
//                 <p className="text-text-Lightest">Shipping</p>
//                 <p className="text-text-Lightest">৳ {shippingCharge}</p>
//               </div>
//               {/* <hr className="mt-1" />
//               <div className="flex justify-between mt-4">
//                 <p className="text-text-Lightest">Total</p>
//                 <p className="text-text-Lightest">৳ {calculateGrandTotal()}</p>
//               </div> */}
//               <div className="flex justify-between mt-4">
//                 <p className="text-text-Lightest">Total</p>
//                 <p className="text-text-Lightest">৳ {grandTotal}</p>
//               </div>
//               <hr className="mt-1" />

//               <div className="flex my-2 gap-2 mt-4">
//                 {!userGetLoading && userInfo?.data?._id ? (
//                   <Link href="/checkout" onClick={handleOrderProduct}>
//                     <Button
//                       className="w-full"
//                       variant="default"
//                       // onClick={handleOrderProduct}
//                     >
//                       Proceed To Checkout
//                     </Button>
//                   </Link>
//                 ) : (
//                   <Link href="/login" className="w-full">
//                     <Button className="w-full" variant="default">
//                       <FaLock /> Please Login To Checkout
//                     </Button>
//                   </Link>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </Contain>
//     </div>
//   );
// };

// export default AddToCart;
