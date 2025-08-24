"use client";

import { useState } from "react";
import { FaChevronDown, FaChevronUp, FaRegStar, FaStar } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ReviewAndReply from "./ReviewAndReply";
import { BASE_URL } from "@/components/utils/baseURL";
import { useQuery } from "@tanstack/react-query";
import PaginationWithPageBtn from "@/components/common/paginationWithPageBtn/PaginationWithPageBtn";
import { averageRatingStar } from "@/utils/average";

const ProductReviewAccordion = ({ product }) => {
  const productId = product?._id;
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  // Fetch product reviews using React Query
  const { data: reviewsData = [], isLoading: isLoadingReviews } = useQuery({
    queryKey: [`/api/v1/review/${productId}?page=${page}&limit=${limit}`],
    queryFn: async () => {
      if (!productId) return [];
      try {
        const res = await fetch(
          `${BASE_URL}/review/${productId}?page=${page}&limit=${limit}`,
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
      } catch (error) {
        console.error("Fetch error:", error);
        throw error;
      }
    },
    enabled: !!productId,
  });

  const rating = parseFloat(product?.avarage_review_ratting || 0).toFixed(1);
  const [reviewsOpen, setReviewsOpen] = useState(false);

  return (
    <div className="my-4">
      <div className="border-y  ">
        {/* Accordion Header */}
        <div
          className=" px-3 flex items-center justify-between py-2 cursor-pointer"
          onClick={() => setReviewsOpen(!reviewsOpen)}
        >
          <p className="flex items-center font-semibold text-gray-700">
            {/* <span className="text-[20px] mr-2">
              <FaRegStar className="text-[18px] text-primary" />
            </span>{" "} */}
            Reviews
          </p>
          {reviewsOpen ? (
            <FaChevronUp className="text-[20px] font-light text-gray-600" />
          ) : (
            <FaChevronDown className="text-[20px] font-light text-gray-600" />
          )}
        </div>

        {/* Accordion Body */}
        <div
          className={`grid overflow-hidden transition-all duration-500 ease-in-out ${
            reviewsOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="p-6">
              {isLoadingReviews ? (
                // Show Skeleton while loading
                <div>
                  <Skeleton height={20} width={200} className="mb-2" />
                  <Skeleton height={30} width={100} className="mb-2" />
                  <div className="flex gap-1">
                    <Skeleton width={24} height={24} circle />
                    <Skeleton width={24} height={24} circle />
                    <Skeleton width={24} height={24} circle />
                    <Skeleton width={24} height={24} circle />
                    <Skeleton width={24} height={24} circle />
                  </div>
                  <Skeleton height={15} width={250} className="mt-2" />
                  <Skeleton height={50} className="mt-4" />
                  <Skeleton height={50} className="mt-2" />
                  <Skeleton height={50} className="mt-2" />
                </div>
              ) : (
                // Show actual content when loaded
                <>
                  <p className="text-gray-700 mb-2 text-sm font-semibold">
                    Customer Reviews ({reviewsData?.totalData || 0} )
                  </p>

                  <div className="flex flex-wrap w-full">
                    <div className="w-full md:w-1/2">
                      <h1 className="py-1.5">{rating} / 5</h1>
                      <div className="flex items-center gap-1 md:text-3xl sm:text-2xl text-xl">
                        {averageRatingStar(rating)}
                      </div>
                      <p className="text-sm my-2 text-gray-500">
                        All reviews come from verified purchasers
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="border-y pl-1 py-2 text-sm font-semibold text-gray-900">
                      Product Reviews
                    </p>
                    <ReviewAndReply reviewsData={reviewsData} />
                    {reviewsData?.totalData > limit && (
                      <PaginationWithPageBtn
                        page={page}
                        setPage={setPage}
                        rows={limit}
                        setRows={setLimit}
                        totalData={reviewsData?.totalData}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReviewAccordion;
