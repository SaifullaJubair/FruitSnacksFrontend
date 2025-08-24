"use client";

import PaginationWithPageBtn from "@/components/common/paginationWithPageBtn/PaginationWithPageBtn";
import CustomLoader from "@/components/shared/loader/CustomLoader";
import { LoaderOverlay } from "@/components/shared/loader/LoaderOverlay";
import { BASE_URL } from "@/components/utils/baseURL";
import { EnglishDateWithTimeShort } from "@/components/utils/EnglishDateWithTimeShort";
import { useUserInfoQuery } from "@/redux/feature/auth/authApi";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { FiExternalLink } from "react-icons/fi";

const OfferHistory = () => {
  const { data: userInfo, isLoading: userLoading } = useUserInfoQuery();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const customer_id = userInfo?.data?._id;

  const {
    data: offerOrdersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      `/api/v1/offer_order?customer_id=${customer_id}&page=${page}&limit=${limit}&search=${searchTerm}`,
    ],
    queryFn: async () => {
      const res = await fetch(
        `${BASE_URL}/offer_order?customer_id=${customer_id}&page=${page}&limit=${limit}&search=${searchTerm}`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(
          `Error: ${res.status} ${res.statusText} - ${errorData}`
        );
      }

      const data = await res.json();
      return data;
    },
  });

  if (isLoading || userLoading) {
    return <CustomLoader />;
  }

  return (
    <div className="">
      <h4 className=" bg-primary p-4 text-white mb-6">Offer History</h4>
      <div className="  ">
        <div>
          <div className="">
            {/* Make the table wrapper horizontally scrollable */}
            <div className="overflow-x-auto scrollbar-thin ">
              <table className="divide-y bg-white text-sm min-w-full border">
                <thead className="">
                  <tr className="divide-gray-300 font-semibold text-center text-gray-900 ">
                    <td className="whitespace-nowrap p-4 ">SL No</td>

                    <td className="whitespace-nowrap p-4 ">Invoice ID</td>
                    <td className="whitespace-nowrap p-4 ">Offer Name</td>
                    <td className="whitespace-nowrap p-4 ">Order Date</td>
                    <td className="whitespace-nowrap p-4 ">Payment Status</td>
                    <td className="whitespace-nowrap p-4 ">Subtotal</td>
                    <td className="whitespace-nowrap p-4 ">Discount</td>
                    <td className="whitespace-nowrap p-4 ">Shipping Cost</td>
                    <td className="whitespace-nowrap p-4 ">Grand Total</td>
                    <td className="whitespace-nowrap p-4 ">Invoice Details</td>
                  </tr>
                </thead>
                <tbody className="divide-y text-center">
                  {offerOrdersData?.data?.map((item, index) => (
                    <tr
                      key={item?._id}
                      className={`  space-y-2 py-2 ${
                        index % 2 === 0 ? "" : "bg-gray-50"
                      }`}
                    >
                      <td className="whitespace-nowrap p-4">{index + 1}</td>

                      <td className="whitespace-nowrap p-4 font-bold">
                        {" "}
                        <Link
                          href={`/offer-orders/${userInfo?.data?._id}/${item?._id}`}
                          className="flex items-center justify-center gap-1 text-primary hover:underline"
                        >
                          {item?.invoice_id}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap p-4">
                        {" "}
                        {item?.offer_id?.offer_title}
                      </td>
                      <td className="whitespace-nowrap p-4">
                        {item?.createdAt &&
                          EnglishDateWithTimeShort(item?.createdAt)}
                      </td>
                      <td className="whitespace-nowrap p-4">
                        {item?.order_status}
                      </td>
                      <td className="whitespace-nowrap p-4">
                        ৳ {item?.sub_total_amount}
                      </td>
                      <td className="whitespace-nowrap p-4">
                        ৳ {item?.discount_amount}
                      </td>
                      <td className="whitespace-nowrap p-4">
                        ৳ {item?.shipping_cost}
                      </td>
                      <td className="whitespace-nowrap p-4">
                        {" "}
                        ৳ {item?.grand_total_amount}{" "}
                      </td>
                      <td className="whitespace-nowrap p-4">
                        <Link
                          href={`/offer-orders/${userInfo?.data?._id}/${item?._id}`}
                          className="flex items-center justify-center gap-1 text-primary hover:underline"
                        >
                          Visit <FiExternalLink size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* pagination */}
        <div className="flex justify-end mt-6">
          <PaginationWithPageBtn
            page={page}
            setPage={setPage}
            rows={limit}
            setRows={setLimit}
            totalData={offerOrdersData?.totalData}
          />
        </div>
      </div>
    </div>
  );
};

export default OfferHistory;
