"use client";

import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "@/components/utils/baseURL";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IoIosArrowRoundForward } from "react-icons/io";
import { titleFont } from "@/utils/font";
import LatestProductGrid from "./LatestProductGrid";

const LatestProducts = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["new_arrival_products"],
    queryFn: async () => {
      const res = await fetch(
        `${BASE_URL}/product/new_arrival?page=1&limit=8`
      );
      const data = await res.json();
      return data;
    },
  });

  const products = data?.data;

  return (
    <div className="py-4 md:py-10">
      <div className="max-w-[98%] mx-auto">
        <div className="flex justify-between items-center flex-col sm:flex-row pb-4 md:pb-8">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-800"
            style={{ fontFamily: titleFont.style.fontFamily }}
          >
            New <span className="text-primary-500">Arrival</span>
          </h2>
          <Link href={"/shop"}>
            <Button variant="link">
              All Products
              <IoIosArrowRoundForward />
            </Button>
          </Link>
        </div>
        <LatestProductGrid products={products} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default LatestProducts;