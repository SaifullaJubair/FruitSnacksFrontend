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
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CheckoutProduct = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sendData),
      });
      const result = await response.json();
      if (response.success) {
        sessionStorage.removeItem("order_info");
      }
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success(
          result?.message ? result?.message : "Order created successfully",
          {
            autoClose: 1000,
          }
        );
        setLoading(false);
      } else {
        toast.error(result?.message || "Something went wrong", {
          autoClose: 1000,
        });
        setLoading(false);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error posting data:", error);
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
              </div>
              <div className=" ">
                <div className="   py-6 px-3 bg-white shadow-sm">
                  <p className="text-xl font-medium">Order Summary</p>
                  <div className="flex justify-between  mt-4">
                    <div>
                      <p className="text-text-default">Subtotal</p>
                      <p className="text-text-default">Discount Amount</p>
                      <p className="text-text-default">Shipping Cost</p>
                      <p className="text-text-default">Delivery Location</p>
                    </div>
                    <div>
                      <p className="fo">৳ {orderData?.sub_total_amount}</p>
                      <p className="">৳ {orderData?.discount_amount}</p>
                      <p className="">৳ {orderData?.shipping_cost}</p>
                      <p className="">{orderData?.shipping_location}</p>
                    </div>
                  </div>
                  <hr className="mt-2" />
                  <div className="flex justify-between mt-4">
                    <p className="text-text-default">Grand Total</p>
                    <p className="font-medium text-primary">
                      ৳ {orderData?.grand_total_amount}
                    </p>
                  </div>
                  <p className="text-text-Lightest text-right my-2 text-xs">
                    VAT included, where applicable
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
        </div>
      </Contain>
    </div>
  );
};

export default CheckoutProduct;
