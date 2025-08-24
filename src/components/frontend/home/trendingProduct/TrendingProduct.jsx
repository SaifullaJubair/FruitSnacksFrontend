"use client";

import Contain from "@/components/common/Contain";

import TrendingSlider from "./TrendingSlider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IoIosArrowRoundForward } from "react-icons/io";
import useGetTrendingProducts from "@/components/lib/getTrendingProducts";
import { yatra } from "@/utils/font";

const TrendingProduct = () => {
  const { data: products = [], isLoading } = useGetTrendingProducts();

  return (
    <div className="bg-[#F4F4F4] py-16 ">
      <div className="max-w-[98%] mx-auto">
        <div className="flex justify-between items-center flex-col sm:flex-row  pb-8">
          {" "}
          <h2
            className="text-2xl sm:text-3xl md:text-4xl  font-bold text-center text-gray-800"
            style={{
              fontFamily: yatra.style.fontFamily,
            }}
          >
            Trending <span className="text-primaryVariant-500">Product</span>
          </h2>
          <Link href={"/all-trending-products"}>
            {" "}
            <Button variant="link">
              All Trending Product
              <IoIosArrowRoundForward />
            </Button>
          </Link>
        </div>

        <TrendingSlider products={products?.data?.data} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default TrendingProduct;
