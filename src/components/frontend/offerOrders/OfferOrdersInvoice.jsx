"use client";
import useGetSettingData from "@/components/lib/getSettingData";
import CustomLoader from "@/components/shared/loader/CustomLoader";
import { BASE_URL } from "@/components/utils/baseURL";
import { EnglishDateWithTimeShort } from "@/components/utils/EnglishDateWithTimeShort";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useParams } from "next/navigation";

const OfferOrdersInvoice = () => {
  const { offerId } = useParams();

  const { data: offerOrders, isLoading } = useQuery({
    queryKey: `[/api/v1/offer_order/${offerId}]`,
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/offer_order/${offerId}`, {
        credentials: "include",
      });
      const data = await res.json();
      return data;
    },
  });

  const { data: settingData, isLoading: settingDataLoading } =
    useGetSettingData();
  if (isLoading || settingDataLoading) {
    return <CustomLoader />;
  }
  // console.log(offerId, 111, offerOrders);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className=" bg-white border shadow-md">
        <div className="flex justify-between bg-primary p-2.5  text-white items-center">
          <h2 className="text-white">Offer&apos;s INVOICE</h2>
          <div>
            <img
              src={settingData?.data[0]?.logo}
              alt="logo"
              className="w-12 h-12"
            />
          </div>
        </div>

        <div className=" p-2.5  grid grid-cols-2 divide-x-2 gap-4 divide-primaryVariant-300  border-b-2 border-primary  ">
          <div className=" px-4">
            <p className=" font-medium uppercase">Offer Name</p>
            <p className="font-medium text-xl">
              {offerOrders?.data?.offer_id?.offer_title}
            </p>
          </div>

          <div className=" px-4">
            {" "}
            <img
              src={offerOrders?.data?.offer_id?.offer_image}
              alt="offer_image"
              className="w-full h-[100px] "
            />
          </div>
        </div>
        <div className=" p-2.5  border-b-2 border-primary    grid grid-cols-4 divide-x-2 divide-primaryVariant-300 gap-4">
          <div className=" px-4">
            <p className=" font-medium uppercase">Billing To</p>
            <p className="font-medium text-xl">
              {offerOrders?.data?.customer_id?.user_name}
            </p>
            <p className="">{offerOrders?.data?.customer_id?.user_phone}</p>
            <p className="">{offerOrders?.data?.billing_address}</p>
            <p className="">{offerOrders?.data?.billing_state}</p>
          </div>

          <div className=" px-4">
            {" "}
            <p className=" font-medium uppercase">Invoice Number</p>
            <p className="font-medium text-xl">
              {offerOrders?.data?.invoice_id}
            </p>
          </div>
          <div className="  px-4">
            {" "}
            <p className=" font-medium uppercase">Date Issue</p>
            <p className="font-medium text-xl">
              {EnglishDateWithTimeShort(
                offerOrders?.data?.customer_id?.createdAt
              )}
            </p>
          </div>
          <div className=" px-4">
            {" "}
            <p className=" font-medium uppercase">Total Amount</p>
            <p className="font-medium text-xl">
              ৳ {offerOrders?.data?.grand_total_amount}
            </p>
          </div>
        </div>
        <div className="">
          <div className="mb-4 overflow-x-auto p-4 ">
            <table className="min-w-full text-sm ">
              <thead className="border-b">
                <tr className="text-gray-900">
                  <th className="whitespace-nowrap p-4">SL</th>
                  <th className="whitespace-nowrap p-4">Image</th>
                  <th className="whitespace-nowrap p-4">Product Info</th>
                  <th className="whitespace-nowrap p-4">Offer Price</th>
                  <th className="whitespace-nowrap p-4">Quantity</th>
                  <th className="whitespace-nowrap p-4">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-gray-200">
                {offerOrders?.data?.offer_products?.map((product, idx) => (
                  <tr
                    key={idx}
                    className={`divide-y divide-gray-100 space-y-2 py-2 text-center ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="whitespace-nowrap p-4">{idx + 1}</td>
                    <td className="py-2 flex justify-center">
                      {product?.variation_id ? (
                        <img
                          src={product?.variation_id?.variation_image}
                          className="w-20 h-[72px]   border"
                          alt=""
                        />
                      ) : (
                        <img
                          src={product?.offer_product_id?.main_image}
                          className="w-20 h-[72px]   border"
                          alt=""
                        />
                      )}
                    </td>
                    <td className="min-w-[260px] py-2.5 text-gray-700 px-4">
                      <div className="mt-1">
                        <p className="mb-1">
                          {product?.offer_product_id?.product_name}
                        </p>
                        <div className="text-text-Lighter items-center">
                          {product?.variation_id && (
                            <p>
                              Variation: {product?.variation_id?.variation_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap py-2.5 font-medium text-gray-700 px-4">
                      <div className="flex items-center gap-2 justify-center">
                        {product?.offer_product_price}
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-2.5 font-medium text-gray-700 px-4">
                      {product?.offer_product_quantity}
                    </td>
                    <td className="whitespace-nowrap py-2.5 font-medium text-gray-700 px-4">
                      ৳{""}
                      <span>
                        {" "}
                        {product?.offer_product_price *
                          product?.offer_product_quantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-primary">
            🎉 Thank You for Your Order!
          </h2>
          <p className="text-gray-600">
            We appreciate your purchase and are working to get your order to you
            as soon as possible.
          </p>
        </div>
        <div className="mt-3">
          <div className="px-4 grid grid-cols-2 gap-x-6 gap-y-3 bg-gray-50 p-4  ">
            <p className=" font-medium uppercase">Shipping Location</p>
            <p className=" font-medium uppercase">
              {offerOrders?.data?.shipping_location}
            </p>

            <p className=" font-medium uppercase">Sub Total Amount</p>
            <p className=" font-medium">
              {" "}
              ৳ {offerOrders?.data?.sub_total_amount}
            </p>
            <p className=" font-medium uppercase">Shipping Cost</p>
            <p className=" font-medium">
              {" "}
              ৳ {offerOrders?.data?.shipping_cost}
            </p>
            <p className=" font-medium uppercase">Grand Total Amount</p>
            <p className=" font-bold">
              {" "}
              ৳ {offerOrders?.data?.grand_total_amount}
            </p>
          </div>
        </div>
        <div className="p-4">
          {" "}
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
              <p>
                📍 Visit Us:{" "}
                <a
                  href="https://www.ecommerce.com"
                  className="text-primary hover:underline"
                >
                  www.ecommerce.com
                </a>
              </p>
              <p className="mt-2">📧 Support : {settingData?.data[0]?.email}</p>
              <p className="mt-2">
                📞 Contact : {settingData?.data[0]?.contact}
              </p>
              <p className="mt-2">© 2023 All Rights Reserved.</p>
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
    </div>
  );
};

export default OfferOrdersInvoice;
