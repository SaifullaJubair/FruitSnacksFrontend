"use client";
import getReviewInDashBoard from "@/components/lib/getReviewInDashboard";
import getUnReviewDashBoardProduct from "@/components/lib/getUnReviewDashBoard";
import CustomLoader from "@/components/shared/loader/CustomLoader";
import { useState } from "react";
import ToBeReviewedTab from "./ToBeReviewedTab";
import ReviewHistory from "./ReviewHistory";

const DashBoardReview = ({ userInfo }) => {
  const id = userInfo?.data?._id;
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isActive, setIsActive] = useState(1);
  const {
    data: reviewData,
    isLoading: reviewLoading,
    refetch: refetchReview,
  } = getReviewInDashBoard(id, page, limit);
  const {
    data: orderData,
    isLoading: orderLoading,
    refetch: refetchOrder,
  } = getUnReviewDashBoardProduct(id, page, limit);

  if (reviewLoading || orderLoading) {
    return <CustomLoader />;
  }
  return (
    <div>
      <ul className="flex items-center  px-1 pt-1 gap-5 mb-4 bg-white border">
        <li
          className={`${
            isActive === 1 && " !border-primary !text-primary font-semibold "
          } px-6 py-2 border-b text-[#424242] transition duration-300 border-transparent cursor-pointer whitespace-nowrap`}
          onClick={() => setIsActive(1)}
        >
          {" "}
          To Be Reviewed
        </li>
        <li
          className={`${
            isActive === 2 && "!border-primary !text-primary font-semibold"
          } px-6 py-2 border-b text-[#424242] transition duration-300 border-transparent cursor-pointer whitespace-nowrap`}
          onClick={() => setIsActive(2)}
        >
          {" "}
          Review History
        </li>
      </ul>
      {isActive === 1 && (
        <ToBeReviewedTab
          products={orderData?.data}
          userId={id}
          refetchOrder={refetchOrder}
          refetchReview={refetchReview}
        />
      )}
      {isActive === 2 && (
        <ReviewHistory
          products={reviewData?.data}
          totalData={reviewData?.totalData}
          setPage={setPage}
          setLimit={setLimit}
          page={page}
          limit={limit}
          setIsActive={setIsActive}
        />
      )}
    </div>
  );
};

export default DashBoardReview;
