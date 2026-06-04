"use client";

import { useEffect, useMemo, useCallback, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import PhoneInput, {
  formatPhoneNumber,
  isPossiblePhoneNumber,
  isValidPhoneNumber,
} from "react-phone-number-input";

import CartTable from "./CartTable";
import CartSummary from "./CartSummary";
import Contain from "../../common/Contain";
import DeliveryInformation from "../checkout/DeliveryInformation";
import { Button } from "@/components/ui/button";
import CartTableSkeleton from "@/components/shared/loader/CartTableSkeleton";
import DeliveryInformationSkeleton from "@/components/shared/loader/DeliveryInformationSkeleton";
import CartSummarySkeleton from "@/components/shared/loader/CartSummarySkeleton";

import { BASE_URL } from "@/components/utils/baseURL";
import { fetchCartDetails } from "@/utils/fetchCartDetails";
import { productPrice, useCartCalculations } from "@/utils/helper";
import { useUserInfoQuery } from "@/redux/feature/auth/authApi";
import useGetSettingData from "@/components/lib/getSettingData";
import { allRemoveFromCart } from "@/redux/feature/cart/cartSlice";
import useGetZoneData from "@/components/lib/getZoneData";

// ✅ একটাই hook — সব platform
import useAnalytics from "@/components/analyticsScripts/utils/useAnalytics";

export const CART_QUERY_KEY = "/api/v1/product/cart_product";

const AddToCart = () => {
  const navigate = useRouter();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { products } = useSelector((state) => state.cart);
  const { trackPurchase, trackInitiateCheckout } = useAnalytics();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [mounted, setMounted] = useState(false);
  const initiateCheckoutFired = useRef(false);
  useEffect(() => setMounted(true), []);

  const { data: userInfo, isLoading: userGetLoading } = useUserInfoQuery();
  const { data: settingData } = useGetSettingData();

  // products এর শুধু id গুলো key হিসেবে ব্যবহার করো
  const cartKey = products
    .map((p) => `${p.productId}-${p.variation_product_id || ""}`)
    .join(",");

  const { data: cartData = [], isLoading: cartLoading } = useQuery({
    queryKey: [CART_QUERY_KEY, cartKey], // ✅ product add/remove এ key বদলায়
    queryFn: async () => {
      const res = await fetchCartDetails(products);
      return res?.data || [];
    },
    enabled: mounted && products?.length > 0,
    staleTime: Infinity,
  });
  const isLoading = !mounted || cartLoading;
  const [divisionID, setDivisionID] = useState();
  const [division, setDivision] = useState();
  const [districtId, setDistrictId] = useState("");
  const [district, setDistrict] = useState();
  const [isOpenDistrict, setIsOpenDistrict] = useState(true);
  const [couponData, setCouponData] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customer_phone, setUserPhone] = useState(
    userInfo?.data?.user_phone?.slice(3, 14),
  );
  const [userPhoneLogin, setUserPhoneLogin] = useState(false);

  useEffect(() => {
    if (userInfo?.data?.user_phone)
      setUserPhone(userInfo?.data?.user_phone?.slice(3, 14));
  }, [userInfo?.data?.user_phone]);

  const {
    data: zoneData,
    isLoading: zoneLoading,
    refetch: refetchZone,
  } = useGetZoneData(divisionID);

  const shippingCharge = useMemo(
    () =>
      division === "Dhaka"
        ? settingData?.data?.[0]?.inside_dhaka_shipping_charge || 0
        : settingData?.data?.[0]?.outside_dhaka_shipping_charge || 0,
    [division, settingData],
  );

  const { shopSubtotals, shopGrandTotals, totalDiscount, adjustedPrices } =
    useCartCalculations({ cartData, products, couponData, shippingCharge });

  // ✅ InitiateCheckout
  const handlePhoneChangeWithTracking = useCallback(
    (value) => {
      setUserPhone(value);
      if (!initiateCheckoutFired.current && value) {
        initiateCheckoutFired.current = true;
        trackInitiateCheckout(
          {
            content_ids: cartData?.map((p) => p?._id) || [],
            value: shopGrandTotals || 0,
            num_items: cartData?.length || 1,
          },
          { ph: value, external_id: userInfo?.data?._id },
        );
      }
    },
    [cartData, shopGrandTotals, trackInitiateCheckout, userInfo],
  );

  const handleRemoveFromCache = useCallback(
    (productId, variationId) => {
      queryClient.setQueryData([CART_QUERY_KEY], (old = []) =>
        old.filter((item) => {
          if (variationId)
            return !(
              item._id === productId && item.variations?._id === variationId
            );
          return !(item._id === productId && !item.variations?._id);
        }),
      );
    },
    [queryClient],
  );

  const handleRemoveCoupon = useCallback(() => {
    setCouponData(null);
    setCouponCode("");
    toast.success("Coupon removed successfully!");
  }, []);

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a valid coupon code.");
      return;
    }
    setIsApplyingCoupon(true);
    try {
      const response = await fetch(`${BASE_URL}/coupon/check_coupon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coupon_code: couponCode,
          customer_id: userInfo?.data?._id,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setCouponData(data?.data);
        toast.success("Coupon applied successfully!");
      } else {
        toast.error(data.message || "Failed to apply coupon.");
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  }, [couponCode, userInfo]);

  const handleOrderProduct = useCallback(
    async (formData) => {
      if (!userPhoneLogin && customer_phone) {
        if (
          !formatPhoneNumber(customer_phone) ||
          !isPossiblePhoneNumber(customer_phone) ||
          !isValidPhoneNumber(customer_phone)
        ) {
          toast.error("Mobile number not valid!");
          return;
        }
      }
      if (!customer_phone) {
        toast.error("Phone is required!");
        return;
      }
      if (!district || !division) {
        toast.error("Please select a City and Zone.");
        return;
      }

      const getCookie = (name) => {
        if (typeof document === "undefined") return "";
        const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
        return match ? match[2] : "";
      };

      const orderData = {
        pathao_city_id: parseInt(divisionID),
        pathao_city_name: division,
        pathao_zone_id: parseInt(districtId),
        pathao_zone_name: district,
        order_status: "pending",
        pending_time:
          new Date().toISOString().split("T")[0] +
          " " +
          new Date().toLocaleTimeString(),
        customer_id: userInfo?.data?._id,
        customer_name: formData.customer_name || userInfo?.data?.user_name,
        customer_phone: customer_phone || formData.customer_phone,
        billing_country: "Bangladesh",
        billing_city: district || userInfo?.data?.user_district,
        billing_state: division || userInfo?.data?.user_division,
        billing_address: formData.address || userInfo?.data?.user_address,
        shipping_location:
          division === "Dhaka"
            ? `Inside Dhaka, ${settingData?.data[0]?.inside_dhaka_shipping_days} Days`
            : `Outside Dhaka, ${settingData?.data[0]?.outside_dhaka_shipping_days} Days`,
        sub_total_amount: shopSubtotals || 0,
        discount_amount: totalDiscount || 0,
        shipping_cost: shippingCharge || 0,
        grand_total_amount: shopGrandTotals || 0,
        coupon_id: couponData?._id || null,
        need_user_create: !userInfo?.data?.user_phone,
        fbc: getCookie("_fbc"),
        fbp: getCookie("_fbp"),
        order_products: cartData.map((product) => {
          const isVariation = product?.is_variation;
          const originalPrice = isVariation
            ? product?.variations?.variation_price
            : product?.product_price;
          const originalDiscountPrice = isVariation
            ? product?.variations?.variation_discount_price
            : product?.product_discount_price;
          const cartItem = products.find(
            (item) =>
              item.productId === product._id &&
              (!product.variations?._id ||
                item.variation_product_id === product.variations._id),
          );
          const isCouponApplicable =
            couponData?.coupon_product_type === "specific" &&
            couponData?.coupon_specific_product?.some(
              (item) => item.product_id === product._id,
            );
          const priceKey = product?.variations?._id
            ? `${product._id}-${product.variations._id}`
            : product._id;
          return {
            product_id: product._id,
            variation_id: product.variations?._id || null,
            product_main_price: originalPrice,
            product_main_discount_price: originalDiscountPrice || 0,
            product_unit_price: productPrice(product),
            product_unit_final_price: isCouponApplicable
              ? adjustedPrices[priceKey]
              : productPrice(product),
            product_quantity: cartItem?.quantity || 1,
            product_grand_total_price:
              (isCouponApplicable
                ? adjustedPrices[priceKey]
                : productPrice(product)) * (cartItem?.quantity || 1),
            campaign_id: product?.campaign_details?._id || null,
          };
        }),
      };

      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.message || "Failed to create order");

        dispatch(allRemoveFromCart());
        queryClient.removeQueries({ queryKey: [CART_QUERY_KEY] });
        if (userInfo?.data?._id) {
          await fetch(`${BASE_URL}/cart`, {
            method: "DELETE",
            credentials: "include",
          }).catch(() => {});
        }

        // ✅ Purchase
        trackPurchase(
          { ...orderData, _id: result?.data?.order_id },
          {
            ph: customer_phone,
            fn: formData.customer_name || userInfo?.data?.user_name,
            external_id: userInfo?.data?._id,
          },
        );

        const orderId = result?.data?.order_id;
        const invoiceId = result?.data?.invoice_id;
        // const isGuest = !userInfo?.data?._id || orderData?.need_user_create;
        const isGuest = result?.data?.user_created === true;

        toast.success(result.message || "Order created successfully", {
          autoClose: 1500,
        });
        await new Promise((r) => setTimeout(r, 300));
        const params = new URLSearchParams();
        if (orderId) params.set("order_id", orderId);
        if (invoiceId) params.set("invoice_id", invoiceId);
        if (isGuest) params.set("guest", "true");
        navigate.push(`/orders/order-success?${params.toString()}`);
      } catch (error) {
        toast.error(error.message || "Something went wrong", {
          autoClose: 1000,
        });
        setLoading(false);
      }
    },
    [
      userPhoneLogin,
      customer_phone,
      district,
      division,
      userInfo,
      shopSubtotals,
      totalDiscount,
      shippingCharge,
      shopGrandTotals,
      couponData,
      cartData,
      products,
      adjustedPrices,
      settingData,
      dispatch,
      navigate,
      divisionID,
      districtId,
      queryClient,
      trackPurchase,
    ],
  );

  if (!mounted)
    return (
      <div className="min-h-screen bg-[#F4F4F4]/50">
        <Contain>
          <div className="pt-6">
            <CartTableSkeleton />
          </div>
        </Contain>
      </div>
    );

  if (!products?.length)
    return (
      <div className="text-center max-w-md mx-auto mt-2 bg-white p-6 shadow-lg">
        <img
          src="/assets/images/empty/Empty-cuate.png"
          alt="Empty cart"
          className="mx-auto mb-2 w-80"
        />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Your cart is empty!
        </h3>
        <p className="text-gray-600 mb-6">
          Looks like you haven't added anything to your cart yet.
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Link href="/">
            <Button className="w-full">Go Home</Button>
          </Link>
          <Link href="/all-products">
            <Button variant="secondary" className="w-full">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F4F4F4]/50 relative">
      {loading && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Placing your order...</p>
        </div>
      )}
      <form onSubmit={handleSubmit(handleOrderProduct)}>
        <Contain>
          <div className="pt-6">
            <h1 className="font-thin text-text-default">Checkout</h1>
            <p className="font-thin text-text-default">
              There are {products?.length} products in this list
            </p>
          </div>
          <div className="grid md:gap-4 lg:gap-4 grid-cols-1 md:grid-cols-5 lg:grid-cols-4">
            <div className="flex gap-6 md:col-span-3 mt-4 overflow-x-auto pb-6">
              <div className="w-full space-y-6">
                {isLoading ? (
                  <CartTableSkeleton />
                ) : (
                  <CartTable
                    products={products}
                    couponData={couponData}
                    shopProduct={cartData}
                    adjustedPrices={adjustedPrices}
                    onRemoveFromCache={handleRemoveFromCache}
                  />
                )}
                {userGetLoading ? (
                  <DeliveryInformationSkeleton />
                ) : (
                  <DeliveryInformation
                    register={register}
                    userInfo={userInfo}
                    errors={errors}
                    setUserPhoneLogin={setUserPhoneLogin}
                    setUserPhone={handlePhoneChangeWithTracking}
                    customer_phone={customer_phone}
                    setDivision={setDivision}
                    setDistrictId={setDistrictId}
                    setDivisionID={setDivisionID}
                    division={division}
                    district={district}
                    setDistrict={setDistrict}
                    setIsOpenDistrict={setIsOpenDistrict}
                    isOpenDistrict={isOpenDistrict}
                    refetchZone={refetchZone}
                    zoneLoading={zoneLoading}
                    zoneData={zoneData}
                  />
                )}
              </div>
            </div>
            <div className="md:col-span-2 space-y-6 lg:col-span-1">
              {isLoading || userGetLoading ? (
                <CartSummarySkeleton />
              ) : (
                <CartSummary
                  userInfo={userInfo}
                  totalDiscount={totalDiscount}
                  shippingCharge={shippingCharge}
                  shopSubtotals={shopSubtotals}
                  shopGrandTotals={shopGrandTotals}
                  couponData={couponData}
                  couponCode={couponCode}
                  setCouponCode={setCouponCode}
                  isApplyingCoupon={isApplyingCoupon}
                  handleApplyCoupon={handleApplyCoupon}
                  handleRemoveCoupon={handleRemoveCoupon}
                  loading={loading}
                  division={division}
                />
              )}
            </div>
          </div>
        </Contain>
      </form>
    </div>
  );
};

export default AddToCart;
