"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { FiSearch } from "react-icons/fi";
import { useGetAllProductAndSearchProduct } from "@/components/lib/getAllProductandSearchProduct";
import useDebounced from "@/hook/useDebounced";
import { useRouter } from "next/navigation";
import { lineThroughPrice, productPrice } from "@/utils/helper";
import useGetSettingData from "@/components/lib/getSettingData";

const SearchForm = () => {
  const router = useRouter();
  const [tab, setTab] = useState("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [showResults, setShowResults] = useState(false); // State to toggle search results visibility
  const { data: settingsData } = useGetSettingData();
  const { data: searchData = [] } = useGetAllProductAndSearchProduct({
    page,
    limit,
    searchTerm,
  });
  const searchText = useDebounced({ searchQuery: searchValue, delay: 500 });

  const searchRef = useRef(null);

  useEffect(() => {
    setSearchTerm(searchText);
    if (searchText) {
      setShowResults(true); // Show results when there's text
    }
  }, [searchText]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowResults(false);
    if (searchValue === "") return router.push(`/all-products`);

    if (searchValue.trim()) {
      router.push(`/all-products?search=${searchValue}`);
    }
  };

  const handleSearchClick = () => {
    setShowResults(false);
    if (searchValue.trim()) {
      router.push(`/all-products?search=${searchValue}`);
    }
  };
  const currencySymbol = settingsData?.data[0];

  // console.log(searchData?.data);

  return (
    <>
      <form
        onSubmit={handleSubmit}
        ref={searchRef}
        className="relative max-w-7xl mx-auto lg:mx-8 w-full px-4 md:px-0"
      >
        <label htmlFor="Search" className="sr-only">
          Search
        </label>

        <input
          id="search"
          type="search"
          name="search"
          autoComplete="off"
          placeholder="Search products here..."
          className="w-full border border-gray-300 py-1.5 md:py-3 pe-10 shadow-sm sm:text-sm px-3 
                   text-gray-300 placeholder-gray-300 bg-transparent 
                   focus:ring-0 focus:outline-none focus:border-gray-300
                   md:text-gray-800 md:border-primary md:bg-white md:placeholder-gray-500"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setShowResults(true)}
        />

        <button
          type="button"
          className="absolute inset-y-0 md:end-0  end-3 grid w-10 place-content-center 
                   bg-transparent text-white hover:text-gray-300
                   md:bg-primary md:text-white md:hover:bg-primary/90"
          onClick={handleSearchClick}
        >
          <span className="sr-only">Search</span>
          <FiSearch className="text-lg" />
        </button>

        {/* Search Result */}
        {searchValue && searchData?.data?.length > 0 && showResults && (
          <div className="absolute bg-white shadow-lg w-full top-12 overflow-hidden mb-5 z-50">
            <div className="overflow-y-auto scrollbar-thin max-h-[40vh] pb-5">
              {searchData?.data?.map((product) => (
                <Link
                  onClick={() => {
                    setSearchValue("");
                    setShowResults(false);
                  }}
                  href={`/products/${product?.product_slug}`}
                  key={product?._id}
                  className="flex gap-3 items-center py-2 group hover:bg-gray-50 pl-5"
                >
                  <Image
                    height={40}
                    width={40}
                    src={product?.main_image}
                    alt={product?.product_name}
                    loading="lazy"
                  />

                  <article>
                    <p className="text-wrap text-sm group-hover:underline group-hover:text-primary block">
                      {product?.product_name}
                    </p>

                    <div className="flex items-center justify-between space-x-2 mt-2">
                      <div>
                        <span className="font-semibold">
                          {currencySymbol?.currency_symbol}
                          {productPrice(product)}
                        </span>
                        {lineThroughPrice(product) && (
                          <span className="text-sm ml-2 line-through text-gray-400">
                            {currencySymbol?.currency_symbol}
                            {lineThroughPrice(product)}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}
      </form>
    </>
  );
};

export default SearchForm;
