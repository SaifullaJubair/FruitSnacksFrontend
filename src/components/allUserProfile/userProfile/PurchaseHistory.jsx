import PaginationWithPageBtn from "@/components/common/paginationWithPageBtn/PaginationWithPageBtn";
import useGetAllOrders from "@/components/lib/getAllOrders";
import CustomLoader from "@/components/shared/loader/CustomLoader";
import { LoaderOverlay } from "@/components/shared/loader/LoaderOverlay";
import { BASE_URL } from "@/components/utils/baseURL";
import { EnglishDateWithTimeShort } from "@/components/utils/EnglishDateWithTimeShort";
import { useUserInfoQuery } from "@/redux/feature/auth/authApi";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { FiExternalLink } from "react-icons/fi";
import { GoEye } from "react-icons/go";
import { IoMdMenu } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";

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
  // console.log(allOrders);
  if (isLoading || orderLoading) {
    return <CustomLoader />;
  }
  return (
    <div className="">
      <h4 className=" bg-primary p-4 text-white mb-6">Purchase History</h4>
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
                    <td className="whitespace-nowrap p-4 ">Order Date</td>
                    <td className="whitespace-nowrap p-4 ">Order Status</td>
                    <td className="whitespace-nowrap p-4 ">Subtotal</td>
                    <td className="whitespace-nowrap p-4 ">Discount</td>
                    <td className="whitespace-nowrap p-4 ">Shipping Cost</td>
                    <td className="whitespace-nowrap p-4 ">Grand Total</td>
                    <td className="whitespace-nowrap p-4 ">Invoice Details</td>
                  </tr>
                </thead>
                <tbody className="divide-y text-center">
                  {allOrders?.data?.map((item, index) => (
                    <tr
                      key={item?._id}
                      className={`  space-y-2 py-2 ${
                        index % 2 === 0 ? "" : "bg-gray-50"
                      }`}
                    >
                      <td className="whitespace-nowrap p-4">{index + 1}</td>

                      <td className="whitespace-nowrap p-4 font-bold">
                        <Link
                          href={`/orders/${userInfo?.data?._id}/${item?._id}`}
                          className="flex items-center justify-center gap-1 text-primary hover:underline"
                        >
                          {item?.invoice_id}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap p-4">
                        {item?.createdAt &&
                          EnglishDateWithTimeShort(item?.createdAt)}
                      </td>
                      <td className="whitespace-nowrap p-4">
                        {item?.order_status == "shipped" ? (
                          <a
                            href={`https://merchant.pathao.com/tracking?consignment_id=${
                              item?.consignment_id
                            }&phone=${item?.customer_id?.user_phone?.slice(3)}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <GoEye
                              size={22}
                              className="cursor-pointer text-gray-500 hover:text-gray-300 ml-8"
                            />
                          </a>
                        ) : (
                          item?.order_status
                        )}
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
                          href={`/orders/${userInfo?.data?._id}/${item?._id}`}
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
            totalData={allOrders?.totalData}
          />
        </div>
      </div>
    </div>
  );
};

export default PurchaseHistory;
