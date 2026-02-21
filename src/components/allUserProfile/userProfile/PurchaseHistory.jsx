import PaginationWithPageBtn from "@/components/common/paginationWithPageBtn/PaginationWithPageBtn";
import useGetAllOrders from "@/components/lib/getAllOrders";
import CustomLoader from "@/components/shared/loader/CustomLoader";
import { EnglishDateWithTimeShort } from "@/components/utils/EnglishDateWithTimeShort";
import { useUserInfoQuery } from "@/redux/feature/auth/authApi";
import Link from "next/link";
import { useState } from "react";
import { FiExternalLink } from "react-icons/fi";
import { FaTruck } from "react-icons/fa";

const ORDER_STATUS_COLOR = {
  pending: "bg-orange-100 text-orange-600",
  processing: "bg-blue-100 text-blue-600",
  shipped: "bg-purple-100 text-purple-600",
  delivered: "bg-green-100 text-green-600",
  cancel: "bg-red-100 text-red-600",
  return: "bg-yellow-100 text-yellow-600",
};

const PurchaseHistory = () => {
  const { data: userInfo, isLoading } = useUserInfoQuery();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: allOrders = [], isLoading: orderLoading } = useGetAllOrders({
    customer_id: userInfo?.data?._id,
    page,
    limit,
    searchTerm,
  });

  if (isLoading || orderLoading) return <CustomLoader />;

  return (
    <div>
      <h4 className="bg-primary p-4 text-white mb-6">Purchase History</h4>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="divide-y bg-white text-sm min-w-full border">
          <thead>
            <tr className="font-semibold text-center text-gray-900">
              <td className="whitespace-nowrap p-4">SL No</td>
              <td className="whitespace-nowrap p-4">Invoice ID</td>
              <td className="whitespace-nowrap p-4">Order Date</td>
              <td className="whitespace-nowrap p-4">Order Status</td>
              <td className="whitespace-nowrap p-4">Grand Total</td>
              <td className="whitespace-nowrap p-4">Track</td>
              <td className="whitespace-nowrap p-4">Details</td>
            </tr>
          </thead>
          <tbody className="divide-y text-center">
            {allOrders?.data?.map((item, index) => (
              <tr
                key={item?._id}
                className={index % 2 === 0 ? "" : "bg-gray-50"}
              >
                <td className="whitespace-nowrap p-4">{index + 1}</td>
                <td className="whitespace-nowrap p-4 font-bold">
                  <Link
                    href={`/orders/${userInfo?.data?._id}/${item?._id}`}
                    className="text-primary hover:underline"
                  >
                    {item?.invoice_id}
                  </Link>
                </td>
                <td className="whitespace-nowrap p-4 text-gray-500 text-xs">
                  {item?.createdAt && EnglishDateWithTimeShort(item?.createdAt)}
                </td>
                <td className="whitespace-nowrap p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      ORDER_STATUS_COLOR[item?.order_status] ||
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item?.order_status}
                  </span>
                </td>
                <td className="whitespace-nowrap p-4 font-semibold">
                  ৳{item?.grand_total_amount}
                </td>

                {/* ── Track button ────────────────────────────── */}
                <td className="whitespace-nowrap p-4">
                  <Link
                    href={`/orders/order-tracking/${item?.invoice_id}`}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-primary text-white hover:opacity-90 transition"
                  >
                    <FaTruck size={11} /> Track
                  </Link>
                </td>

                <td className="whitespace-nowrap p-4">
                  <Link
                    href={`/orders/${userInfo?.data?._id}/${item?._id}`}
                    className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                  >
                    View <FiExternalLink size={13} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-6">
        <PaginationWithPageBtn
          page={page}
          setPage={setPage}
          rows={limit}
          setRows={setLimit}
          totalData={allOrders?.totalData}
        />
      </div>
    </div>
  );
};

export default PurchaseHistory;
