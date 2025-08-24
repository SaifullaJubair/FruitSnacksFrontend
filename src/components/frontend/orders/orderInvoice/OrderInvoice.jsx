"use client";
import useGetSettingData from "@/components/lib/getSettingData";
import CustomLoader from "@/components/shared/loader/CustomLoader";
import { BASE_URL } from "@/components/utils/baseURL";
import { EnglishDateWithTimeShort } from "@/components/utils/EnglishDateWithTimeShort";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useParams } from "next/navigation";

const OrderInvoice = () => {
  const { orderId } = useParams();
  const { data: settingData, isLoading: settingDataLoading } =
    useGetSettingData();

  const { data: orders, isLoading } = useQuery({
    queryKey: `[/api/v1/order/${orderId}]`,
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/order/${orderId}`, {
        credentials: "include",
      });
      const data = await res.json();
      return data;
    },
  });
  if (isLoading || settingDataLoading) {
    return <CustomLoader />;
  }

  return (
    <section className="max-w-4xl mx-auto p-4">
      {/* Order Product */}

      <div className="bg-white border shadow-md ">
        <article className=" p-2 flex items-center justify-between gap-2 px-6 bg-primary ">
          <div>
            <h2 className="text-white">
              INVOICE: {orders?.data?.order?.invoice_id}
            </h2>
          </div>
          <div>
            <img
              src={settingData?.data[0]?.logo}
              alt="logo"
              className="w-12 h-12"
            />
          </div>
        </article>
        <div className=" p-2.5 border-b-2 border-primary  grid grid-cols-4 divide-x-2 divide-primaryVariant-300 mt-3 gap-4">
          <div className=" px-4">
            <p className=" font-medium capitalize">Billing To</p>
            <p className="font-medium text-xl">
              {orders?.data?.order?.customer_id?.user_name}
            </p>
            <p className="">{orders?.data?.order?.customer_id?.user_phone}</p>
            <p className="">{orders?.data?.order?.billing_address}</p>
            <p className="">{orders?.data?.order?.billing_state}</p>
          </div>

          <div className=" px-4">
            {" "}
            {/* <p className=" font-medium capitalize">Order Number</p>
            <p className="text-sm">{orders?.data?.order?._id}</p> */}
            <p className=" font-medium capitalize mt-2">Invoice Number</p>
            <p className="">{orders?.data?.order?.invoice_id}</p>
          </div>
          <div className="  px-4">
            {" "}
            <p className=" font-medium capitalize">Date Issue</p>
            <p className="">
              {EnglishDateWithTimeShort(
                orders?.data?.order?.customer_id?.createdAt
              )}
            </p>
          </div>
          <div className=" px-4">
            {" "}
            <p className=" font-medium capitalize">Total Amount</p>
            <p className="font-medium text-2xl">
              ৳ {orders?.data?.order?.grand_total_amount}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <div className="mb-4 overflow-x-auto  p-4 border-b border-primaryVariant-200">
            <table className="min-w-full text-sm ">
              <thead className="">
                <tr className="text-gray-900 border-y bg-[#F4F4F4] ">
                  <th className="whitespace-nowrap p-4">SL</th>
                  <th className="whitespace-nowrap p-4">Image</th>
                  <th className="whitespace-nowrap p-4">Product Info</th>
                  <th className="whitespace-nowrap p-4">Unit Price</th>
                  <th className="whitespace-nowrap p-4">Quantity</th>
                  <th className="whitespace-nowrap p-4">Total Price</th>
                </tr>
              </thead>
              <tbody className="">
                {orders?.data?.order_products?.map((product, idx) => (
                  <tr
                    key={idx}
                    className={` space-y-2 border-b py-2 text-center ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="whitespace-nowrap p-4">{idx + 1}</td>
                    <td className="py-2 ">
                      <span className="flex flex-col items-center justify-center">
                        {product?.variation_id ? (
                          <img
                            src={product?.variation_id?.variation_image ? product?.variation_id?.variation_image : product?.product_id?.main_image}
                            className="w-20 h-[72px]   border"
                            alt=""
                          />
                        ) : (
                          <img
                            src={product?.product_id?.main_image}
                            className="w-20 h-[72px]   border"
                            alt=""
                          />
                        )}
                      </span>
                    </td>
                    <td className="min-w-[260px] py-2.5 text-gray-700 px-4">
                      <div className="mt-1">
                        <p className="mb-1">
                          {product?.product_id?.product_name}
                        </p>
                        <div className="text-text-Lighter items-center">
                          {/* <p>Brand: {product?.brand}</p> */}
                          {product?.variation_id && (
                            <p>
                              Variation: {product?.variation_id?.variation_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap py-2.5 font-medium text-gray-700 ">
                      <div className="flex items-center gap-2 justify-center">
                        {product?.product_unit_price >
                        product?.product_unit_final_price ? (
                          <div className="flex items-center gap-2">
                            <span className="line-through text-sm">
                              {" "}
                              ৳ {product?.product_unit_price}
                            </span>
                            <span className="">
                              {" "}
                              ৳ {product?.product_unit_final_price}
                            </span>
                          </div>
                        ) : (
                          <span> ৳ {product?.product_unit_price}</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-2.5 font-medium text-gray-700 px-4">
                      {product?.product_quantity}
                    </td>
                    <td className="whitespace-nowrap py-2.5 font-medium text-gray-700 px-4">
                      ৳{product?.product_grand_total_price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="p-4 mb-6 mt-2 gap-6 flex flex-col ">
          {/* Thank You Message */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-primary">
              🎉 Thank You for Your Order!
            </h2>
            <p className="text-gray-600">
              We appreciate your purchase and are working to get your order to
              you as soon as possible.
            </p>
          </div>

          {/* Order Details */}
          <div className="px-4 grid grid-cols-2 gap-x-6 gap-y-3 bg-gray-50 p-4  ">
            <p className="font-medium capitalize">Shipping Location:</p>
            <p className="capitalize">
              {orders?.data?.order?.shipping_location}
            </p>
            <p className="font-medium capitalize">Sub Total Amount:</p>
            <p>৳ {orders?.data?.order?.sub_total_amount}</p>
            <p className="font-medium capitalize">Shipping Cost:</p>
            <p>৳ {orders?.data?.order?.shipping_cost}</p>

            <p className="font-medium capitalize">Discount:</p>
            <p>৳ {orders?.data?.order?.discount_amount}</p>

            <p className="font-semibold capitalize">Grand Total Amount:</p>
            <h3 className="text-lg font-bold">
              ৳ {orders?.data?.order?.grand_total_amount}
            </h3>
          </div>

          {/* Footer Section */}
          <div className="flex justify-between items-center p-4 mt-4 border-t-2 border-primary">
            {/* Logo */}
            <div className="flex items-center">
              <Image
                src={`${settingData?.data[0].logo}`}
                alt="Logo"
                width={120}
                height={10}
                className="w-20 h-20"
              />
            </div>

            {/* Site Information */}
            <div className="flex flex-col items-end text-right text-sm text-gray-600">
              {/* <p>
                📍 Visit Us:{" "}
                <a
                  href="https://www.ecommerce.com"
                  className="text-primary hover:underline"
                >
                  www.ecommerce.com
                </a>
              </p> */}
              <p className="mt-2">📧 Support : {settingData?.data[0]?.email}</p>
              <p className="mt-2">
                📞 Contact : {settingData?.data[0]?.contact}
              </p>
              <p className="mt-2">© 2025 Classic IT & Sky Mart Ltd</p>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="text-xs text-center text-gray-500 mt-4 border-t pt-2">
            <p>
              By placing an order, you agree to our
              <a href="/terms" className="text-primary hover:underline">
                {" "}
                Terms & Conditions
              </a>{" "}
              and
              <a href="/privacy" className="text-primary hover:underline">
                {" "}
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Order Product */}
    </section>
  );
};

export default OrderInvoice;
