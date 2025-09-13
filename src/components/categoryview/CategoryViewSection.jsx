"use client";
import { titleFont } from "@/utils/font";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { BsFilterLeft } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import { RiHome2Line } from "react-icons/ri";
import NotFoundData from "../common/NotFoundData";
import PaginationWithPageBtn from "../common/paginationWithPageBtn/PaginationWithPageBtn";
import ProductSkeleton from "../shared/loader/ProductSkeleton";
import { BASE_URL } from "../utils/baseURL";
import CategoryViewCard from "./CategoryViewCard";
import FilterSection from "./FilterSection";

const CategoryViewSection = ({ slug, filterData, filterHeadData }) => {
  const [rows, setRows] = useState(20);
  const [page, setPage] = useState(1);

  const [selectedFilters, setSelectedFilters] = useState({
    filters: [],
    min_price: 1,
    max_price: 5000,
    // max_price: filterData?.maxPriceRange ? filterData?.maxPriceRange : 5000,
    availability: [],
    brands: [],
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("");

  const [isModalOpen, setModalOpen] = useState("");
  const [viewProduct, setViewProduct] = useState(null);
  const [defaultProducts, setDefaultsProducts] = useState([]);

  const queryString = encodeURIComponent(JSON.stringify(selectedFilters));

  const { data, isLoading } = useQuery({
    queryKey: [selectedFilters, slug, page, rows],
    queryFn: async () => {
      const res = await fetch(
        `${BASE_URL}/filter_product?categoryType=${slug[0]}&sub_categoryType=${slug[1]}&child_categoryType=${slug[2]}&filterData=${queryString}&page=${page}&limit=${rows}`
      );
      const data = await res.json();
      setDefaultsProducts(data);
      return data;
    },
  });

  // const crumbs = convertToCrumbs(slug);

  const openModal = () => {
    setModalOpen(true);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const sortedData = () => {
    if (selectedSort === "asc") {
      return [...data.data].sort((a, b) => a.product_price - b.product_price);
    } else if (selectedSort === "desc") {
      return [...data.data].sort((a, b) => b.product_price - a.product_price);
    } else {
      return data.data;
    }
  };
  const startIndex = (page - 1) * rows + 1;
  const endIndex = startIndex + Number(rows) - 1;

  return (
    <div className="">
      {/* <div className="bg-white py-2.5 px-4 my-2   shadow">
        <Breadcrumb crumbs={crumbs} />
      </div> */}

      <h2
        className="text-2xl sm:text-3xl mt-4 font-bold text-center md:text-start text-gray-800"
        style={{
          fontFamily: titleFont.style.fontFamily,
        }}
      >
        <span className="capitalize ">{slug[0]}</span>{" "}
      </h2>

      <div className="bg-white py-2.5  mb-2 flex flex-wrap gap-1">
        {filterHeadData?.map((item) => (
          <Link
            key={item._id}
            href={`/category/${slug[0]}/${
              item?.sub_category_id?.sub_category_slug
                ? item?.sub_category_id?.sub_category_slug
                : item?.sub_category_slug
            }/${item?.child_category_slug ? item?.child_category_slug : ""}`}
            className=" px-3 py-[1px] bg-gray-50 border border-gray-400 shadow-sm hover:bg-gray-100"
          >
            <span className="text-primary text-base">
              {item?.sub_category_name
                ? item?.sub_category_name
                : item?.child_category_name}
            </span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-2.5">
        <div className="hidden lg:block">
          <FilterSection
            slug={slug}
            filterData={filterData}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
          />
        </div>
        <div className="col-span-5 lg:col-span-4">
          <div className="bg-white py-1.5 px-4 mb-4   shadow flex justify-between items-center">
            <button onClick={toggleDrawer} className="block lg:hidden">
              <BsFilterLeft className="text-3xl  p-1 bg-gray-100 hover:bg-gray-200" />
            </button>
            <p className="mb-0 flex text-text-semiLight   items-center py-1">
              {" "}
              <span className="text-gray-600 text-xs md:text-sm mr-2">
                Showing:
              </span>
              <Link className="hover:underline underline-offset-2 " href={`/`}>
                <RiHome2Line />
              </Link>
              <span className="mx-1">/</span>{" "}
              <Link
                className="hover:underline underline-offset-2 "
                href={`/category/${slug[0]}`}
              >
                {slug[0]}
              </Link>
              {slug[1] && (
                <>
                  <span className="mx-1">/</span>{" "}
                  <Link
                    className="hover:underline underline-offset-2 "
                    href={`/category/${slug[0]}/${slug[1]}`}
                  >
                    {slug[1]}
                  </Link>{" "}
                </>
              )}
              {slug[2] && (
                <>
                  <span className="mx-1">/</span>{" "}
                  <Link
                    className="hover:underline underline-offset-2 "
                    href={`/category/${slug[0]}/${slug[1]}/${slug[2]}`}
                  >
                    {" "}
                    {slug[2]}{" "}
                  </Link>{" "}
                </>
              )}
              {/* {slug[slug.length - 1]} */}
            </p>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3  lg:grid-cols-4  gap-4 md:gap-y-6">
              {Array.from(Array(12).keys()).map((i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              {data?.totalData > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3  lg:grid-cols-4  gap-4 md:gap-y-6">
                  {sortedData()
                    // .slice(startIndex, endIndex)
                    ?.map((product) => (
                      <CategoryViewCard
                        key={product?._id}
                        product={product}
                        openModal={openModal}
                        setViewProduct={setViewProduct}
                      />
                    ))}
                </div>
              ) : (
                <NotFoundData />
              )}
            </>
          )}
          {data?.totalData > rows && (
            <div className="flex justify-between items-center py-5">
              {/* Pagination */}
              <PaginationWithPageBtn
                rows={rows}
                page={page}
                setPage={setPage}
                setRows={setRows}
                totalData={data?.totalData}
              />
              <div className="text-xs">
                <span className="mr-1 font-semibold text-primary">Showing</span>
                <span className="font-medium text-gray-700 text-xs mr-1">
                  {startIndex === 0 ? 1 : startIndex} -{" "}
                  {endIndex > data?.totalData ? data?.totalData : endIndex}
                </span>
                of {data?.totalData > 0 ? data?.totalData : 0}{" "}
                {data?.totalData > 1 ? "records" : "record"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ------ filter drawer ------ start */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-40 bg-white border-r-2 border-gray-300 w-9/12 sm:w-6/12 md:w-4/12 min-h-screen overflow-y-auto transition-transform duration-500 transform ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="absolute right-2 top-2 items-end"
          onClick={toggleDrawer}
        >
          <IoMdClose className="p-1 text-2xl bg-gray-100 shadow-md " />
        </button>
        <div className="block lg:hidden px-2 mt-10">
          <FilterSection
            slug={slug}
            filterData={filterData}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
          />
        </div>
      </div>
      {/* ------ filter drawer ------ end */}
    </div>
  );
};

export default CategoryViewSection;
