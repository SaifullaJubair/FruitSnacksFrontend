"use client";
import Contain from "@/components/common/Contain";
import MiniSpinner from "@/components/shared/loader/MiniSpinner";
import { Button } from "@/components/ui/button";
import { districts } from "@/data/districts";
import { divisions } from "@/data/divisions";
import { useUserInfoQuery } from "@/redux/feature/auth/authApi";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import Select from "react-select";
import DeliveryInformation from "./DeliveryInformation";
import useGetSettingData from "@/components/lib/getSettingData";
import { BASE_URL } from "@/components/utils/baseURL";
import OrderSummaryTable from "./OrderSummaryTable";
import PaymentMethodPicker from "./PaymentMethodPicker";
import PaymentInitModal from "./PaymentInitModal";
import AdvancePayPicker from "./AdvancePayPicker";
import LoyaltyRedeemPanel from "./LoyaltyRedeemPanel";
import AbandonedCartCapture from "./AbandonedCartCapture";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CheckoutProduct = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  // F3 — watch customer_phone so AbandonedCartCapture knows when to fire.
  // Falls back to the logged-in user's phone when the input is empty.
  const watchedPhone = watch("customer_phone");
  const { data: userInfo, isLoading: userGetLoading } = useUserInfoQuery();
  const { data: settingData, isLoading: settingLoading } = useGetSettingData();
  const [loading, setLoading] = useState(false);

  const [districtsData, setDistrictsData] = useState([]);
  const [districtId, setDistrictId] = useState("");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [isOpenDistrict, setIsOpenDistrict] = useState(true);
  const [couponData, setCouponData] = useState(null);
  const [orderData, setOrderData] = useState(null);

  // ── F1a: payment method state ────────────────────────────────────────
  // settings unwraps to settingData?.data?.[0] (same shape used elsewhere)
  const settings = settingData?.data?.[0];
  const [paymentMethod, setPaymentMethod] = useState("cod");
  // Once settings load, pick the first enabled method as the default if cod
  // happens to be disabled. (Otherwise leave the cod default alone.)
  useEffect(() => {
    if (!settings) return;
    if (settings.cod_enabled === false) {
      if (settings.manual_mfs_enabled) setPaymentMethod("manual_mfs");
      else if (settings.bank_transfer_enabled) setPaymentMethod("bank_transfer");
      else if (settings.sslcommerz_enabled) setPaymentMethod("sslcommerz");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.cod_enabled, settings?.manual_mfs_enabled, settings?.bank_transfer_enabled, settings?.sslcommerz_enabled]);

  // Modal-state — holds the BE response (`{order_id, invoice_id, payment_method,
  // payment_init}`) once placement succeeds.
  const [placementResult, setPlacementResult] = useState(null);

  // ── F1b: advance pay + loyalty redeem ────────────────────────────────
  const [advanceEnabled, setAdvanceEnabled] = useState(false);
  const [advanceMethod, setAdvanceMethod] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [redeemPoints, setRedeemPoints] = useState("");

  // ── F1a: VAT preview (approximation only) ────────────────────────────
  // Server is the source of truth — it recomputes per-line VAT using the
  // product's vat_percentage_override when set, otherwise settings.vat_percentage.
  // The preview here uses settings.vat_percentage on the cart subtotal which is
  // accurate for shops without per-product overrides; if a product carries an
  // override the server may charge a different VAT (the final placed order
  // doc will show the real value). The disclaimer below makes that explicit.
  const vatPercent = Number(settings?.vat_percentage) || 0;
  const vatPreview =
    vatPercent > 0 && orderData?.sub_total_amount
      ? Math.round(
          (Number(orderData.sub_total_amount) -
            Number(orderData.discount_amount || 0)) *
            (vatPercent / 100),
        )
      : 0;

  // F1b — loyalty redeem preview (server caps; this is a UI hint only).
  const redeemRate = Number(settings?.loyalty_redeem_rate) || 0;
  const redeemDiscountPreview =
    redeemRate > 0 && Number(redeemPoints) > 0
      ? Math.round(Math.floor(Number(redeemPoints)) * redeemRate)
      : 0;

  useEffect(() => {
    if (districtId) {
      const districtData = districts.filter(
        (district) => district?.division_id === districtId
      );
      setDistrictsData(districtData);
    }
  }, [districtId]);
  useEffect(() => {
    const sessionCouponData = JSON.parse(
      sessionStorage.getItem("sessionCouponData")
    );
    const sessionDate = sessionStorage.getItem("sessionDate");
    const currentDate = new Date().toISOString().split("T")[0];

    if (sessionDate !== currentDate) {
      sessionStorage.removeItem("sessionCouponData");
      sessionStorage.removeItem("sessionDate");
      sessionStorage.removeItem("order_info");
    }
    setCouponData(sessionCouponData);

    const storedOrderInfo = JSON.parse(sessionStorage.getItem("order_info"));

    setOrderData(storedOrderInfo);
    if (!storedOrderInfo) {
      router.push("/cart");
      return;
    }

    const timeoutId = setTimeout(() => {
      if (storedOrderInfo) {
        const orderTime = new Date(storedOrderInfo?.order_time).getTime();
        const currentTime = new Date().getTime();
        const timeDifference = currentTime - orderTime;

        if (timeDifference > 15 * 60 * 1000) {
          // 15 minutes in milliseconds
          sessionStorage.removeItem("order_info");
          toast.info("Checkout time expired.");
          router.push("/cart");
        }
      }
    }, 15 * 60 * 1000); // 15 minutes in milliseconds

    return () => clearTimeout(timeoutId); // Cleanup function to clear the timeout
  }, [router]);
  //data post function
  const handleDataPost = async (data) => {
    if (!district || !division)
      return toast.error("Please select a district and division.");
    const sendData = {
      order_status: orderData?.order_status,
      sub_total_amount: orderData?.sub_total_amount,
      shipping_cost: orderData?.shipping_cost,
      discount_amount: orderData?.discount_amount,
      grand_total_amount: orderData?.grand_total_amount,
      shipping_location: orderData?.shipping_location,
      billing_city: district,
      billing_state: division,
      billing_address: data?.address,
      customer_phone: data?.customer_phone,
      customer_id: orderData?.customer_id,
      // F1a: tell the server which gateway to initiate post-commit.
      payment_method: paymentMethod || "cod",
      // F1b: optional advance/partial (server validates allow-list + minPct).
      ...(advanceEnabled && advanceMethod && Number(advanceAmount) > 0
        ? {
            advance_amount: Number(advanceAmount),
            advance_method: advanceMethod,
          }
        : {}),
      // F1b: optional loyalty redeem (server caps by balance + max-pct).
      ...(Number(redeemPoints) > 0
        ? { loyalty_redeem_points: Math.floor(Number(redeemPoints)) }
        : {}),
      shop_products: orderData?.shop_products?.map(
        ({ shop_name, ...shop }) => ({
          shop,
          order_products: shop?.order_products?.map(
            ({ product_name, brand, main_image, ...rest }) => rest
          ),
        })
      ),
    };
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/order`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sendData),
      });
      const result = await response.json();
      if (result?.statusCode === 200 && result?.success === true) {
        sessionStorage.removeItem("order_info");
        toast.success(
          result?.message ? result?.message : "Order created successfully",
          {
            autoClose: 1000,
          }
        );
        // F1a: open the PaymentInitModal when the gateway needs the buyer's
        // attention (manual_mfs / bank instructions, sslcommerz redirect, or
        // a "none + error" surfaced from a misconfigured gateway). For pure
        // COD `payment_init.kind === "none"` and we just route to /orders.
        const initKind = result?.data?.payment_init?.kind || "none";
        const initError = result?.data?.payment_init?.error;
        if (initKind === "none" && !initError) {
          router.push("/orders");
        } else {
          setPlacementResult(result.data);
        }
        setLoading(false);
      } else {
        toast.error(result?.message || "Something went wrong", {
          autoClose: 1000,
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Error posting data:", error);
      toast.error(error?.message || "Network error");
      setLoading(false);
    }
  };
  if (userGetLoading || settingLoading) return <MiniSpinner />;
  // console.log("ordersData", orderData);

  return (
    <div className="bg-[#F4F4F4]/50 ">
      <Contain>
        <div className="max-w-6xl m-auto pb-8">
          <form onSubmit={handleSubmit(handleDataPost)}>
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-3">
                {/* Delivery Information */}
                <DeliveryInformation
                  register={register}
                  userInfo={userInfo}
                  errors={errors}
                  setDivision={setDivision}
                  setDistrictId={setDistrictId}
                  setDistrict={setDistrict}
                  setIsOpenDistrict={setIsOpenDistrict}
                  isOpenDistrict={isOpenDistrict}
                  districtsData={districtsData}
                />
                {orderData && <OrderSummaryTable orderData={orderData} />}

                {/* F1a — payment method picker + per-method instructions. */}
                <PaymentMethodPicker
                  settings={settings}
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                />

                {/* F1b — advance/partial pay (only when COD + settings allow). */}
                <AdvancePayPicker
                  settings={settings}
                  paymentMethod={paymentMethod}
                  grandTotal={orderData?.grand_total_amount}
                  advanceEnabled={advanceEnabled}
                  setAdvanceEnabled={setAdvanceEnabled}
                  advanceMethod={advanceMethod}
                  setAdvanceMethod={setAdvanceMethod}
                  advanceAmount={advanceAmount}
                  setAdvanceAmount={setAdvanceAmount}
                />

                {/* F1b — loyalty redeem (only when user logged in + balance > 0). */}
                <LoyaltyRedeemPanel
                  settings={settings}
                  userInfo={userInfo}
                  subTotal={orderData?.sub_total_amount}
                  discountAmount={orderData?.discount_amount}
                  redeemPoints={redeemPoints}
                  setRedeemPoints={setRedeemPoints}
                />
              </div>
              <div className=" ">
                <div className="   py-6 px-3 bg-white shadow-sm">
                  <p className="text-xl font-medium">Order Summary</p>
                  <div className="flex justify-between  mt-4">
                    <div>
                      <p className="text-text-default">Subtotal</p>
                      <p className="text-text-default">Discount Amount</p>
                      <p className="text-text-default">Shipping Cost</p>
                      {vatPreview > 0 && (
                        <p className="text-text-default">VAT ({vatPercent}%)</p>
                      )}
                      {redeemDiscountPreview > 0 && (
                        <p className="text-text-default">
                          Loyalty redeem
                        </p>
                      )}
                      <p className="text-text-default">Delivery Location</p>
                    </div>
                    <div>
                      <p className="fo">৳ {orderData?.sub_total_amount}</p>
                      <p className="">৳ {orderData?.discount_amount}</p>
                      <p className="">৳ {orderData?.shipping_cost}</p>
                      {vatPreview > 0 && <p>৳ {vatPreview}</p>}
                      {redeemDiscountPreview > 0 && (
                        <p className="text-emerald-600">
                          −৳ {redeemDiscountPreview}
                        </p>
                      )}
                      <p className="">{orderData?.shipping_location}</p>
                    </div>
                  </div>
                  <hr className="mt-2" />
                  <div className="flex justify-between mt-4">
                    <p className="text-text-default">Grand Total</p>
                    <p className="font-medium text-primary">
                      ৳{" "}
                      {Math.max(
                        0,
                        Number(orderData?.grand_total_amount || 0) +
                          vatPreview -
                          redeemDiscountPreview,
                      )}
                    </p>
                  </div>
                  <p className="text-text-Lightest text-right my-2 text-xs">
                    {vatPreview > 0
                      ? "VAT estimated; product-specific overrides may adjust the final amount."
                      : "VAT included, where applicable"}
                  </p>
                  <div className="flex my-2 gap-2 mt-4">
                    {loading == true ? (
                      <div className="px-10 py-2 flex items-center justify-center  bg-primary text-white rounded">
                        <MiniSpinner />
                      </div>
                    ) : (
                      <Button
                        className="w-full"
                        variant="default"
                        type="submit"
                      >
                        Placed Order
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* F1a — post-placement gateway handoff (instructions / redirect). */}
          {placementResult && (
            <PaymentInitModal
              result={placementResult}
              paymentMethod={paymentMethod}
              onClose={() => setPlacementResult(null)}
            />
          )}

          {/* F3 — abandoned-cart capture (silent; phone-keyed; BE marks as
              recovered automatically once placement commits with same phone). */}
          <AbandonedCartCapture
            phone={watchedPhone || userInfo?.data?.user_phone}
            name={userInfo?.data?.user_name}
            email={userInfo?.data?.user_email}
            userId={userInfo?.data?._id}
            orderData={orderData}
            step="cart"
          />
        </div>
      </Contain>
    </div>
  );
};

export default CheckoutProduct;
