"use client";
import { Button } from "@/components/ui/button";
import { EnglishDateWithTimeShort } from "@/components/utils/EnglishDateWithTimeShort";
import Link from "next/link";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { HiMinus, HiOutlinePlus } from "react-icons/hi";
import { BsCart } from "react-icons/bs";
import { averageRatingStar } from "@/utils/average";
import { TbShoppingCartOff } from "react-icons/tb";
import { GoGitCompare } from "react-icons/go";
import useGetSettingData from "@/components/lib/getSettingData";
import { isHexColor } from "@/utils/helper";
import { useState } from "react";
import ChartModal from "./ChartModal";

const ProductHighlightSection = ({
  product,
  productPrice,
  lineThoughPrice,
  stock,
  quantity,
  setQuantity,
  handleIncrement,
  handleDecrement,
  isWishlisted,
  handleWishlist,
  handleSelectVariation,
  selectedVariations,
  maxQuantity,
  handleAddToCart,
  handleAddToCompare,
  isCompare,
}) => {
  const rating = parseFloat(product?.avarage_review_ratting || 0).toFixed(1);

  const { data: settingsData } = useGetSettingData();
  const [showChart, setShowChart] = useState(false);
  const currencySymbol = settingsData?.data[0]?.currency_symbol;
  return (
    <div>
      <h2 className="font-semibold text-lg  md:text-2xl text-text-default max-w-screen-md">
        {product?.product_name}{" "}
        {/* {product?.unit && (
          <small className="font-bold"> / ({product?.unit})</small>
        )} */}
      </h2>

      {/* Heading section */}
      {/* <section className=" flex items-center gap-1 mt-4 mb-3 text-sm ">
        {averageRatingStar(rating)}
        <span className="text-gray-500 mr-1">{product?.rating}</span>
        <span className="text-gray-500 mr-1">
          {" "}
          {product?.total_review_ratting} Reviews |
        </span>
        <span className="text-gray-500 mr-2">
          {" "}
          {product?.total_order_count} Sold
        </span>
      </section> */}

      {/* Limited Offer */}
      {(product?.flash_sale_details || product?.campaign_details) && (
        <Link
          href={`/campaign/${product?.campaign_details?._id}`}
          className="flex justify-between items-center bg-primary my-3 px-3 py-1.5"
        >
          {product?.flash_sale_details ? (
            <>
              <h3 className="text-white font-semibold">
                {product?.flash_sale_details?.flash_sale_title}
              </h3>
              <p className="text-slate-100 text-xs">
                {" "}
                Ends:{" "}
                {EnglishDateWithTimeShort(
                  product?.flash_sale_details?.flash_sale_end_time
                )}
              </p>
            </>
          ) : (
            <>
              {" "}
              <h3 className="text-white font-semibold">
                {product?.campaign_details?.campaign_title}
              </h3>
              <p className="text-slate-100 text-xs ">
                {" "}
                Ends:{" "}
                {EnglishDateWithTimeShort(
                  product?.campaign_details?.campaign_end_date
                )}
              </p>
            </>
          )}
        </Link>
      )}

      {/* Price section */}

      <div className="flex items-center flex-wrap gap-3 mt-5 mb-4">
        <div>
          <span className="text-lg text-text-default font-semibold">
            {currencySymbol}
            {productPrice}
          </span>

          {lineThoughPrice && (
            <span className="text-sm ml-2 line-through text-gray-400">
              {currencySymbol} {lineThoughPrice}
            </span>
          )}
        </div>
      </div>

      {/* List  */}
      <div className="flex items-center my-2 gap-x-4 gap-16 flex-wrap">
        <p className="text-sm text-gray-600">
          Type:{" "}
          <Link
            className="text-primary"
            href={`/category/${product?.category_id?.category_slug}`}
          >
            {product?.category_id?.category_name}
          </Link>
        </p>
        <div className="text-sm text-gray-600">
          {product?.brand_id?.brand_name && (
            <p>
              Brand:{" "}
              <span className="text-primary">
                {" "}
                {product?.brand_id?.brand_name}
              </span>
            </p>
          )}
        </div>
      </div>
      {product?.is_variation &&
        product?.attributes_details?.map((item, i) => (
          <section
            className="flex flex-col my-1.5 gap-x-4 gap-y-2 flex-wrap max-w-sm"
            key={i}
          >
            <div className="text-sm text-gray-600">
              <div className="flex flex-col flex-wrap gap-1.5">
                {/* Attribute name: Example: Color: RED, GREEN */}
                <p className="flex items-center gap-1.5 ">
                  {/* Attribute Name : Example: Color */}
                  <span className="capitalize"> {item?.attribute_name}:</span>
                  {/* Selected Attribute Value: Example: RED */}
                  <span className="text-primary">
                    {" "}
                    {selectedVariations[item?.attribute_name]
                      ?.attribute_value_name
                      ? selectedVariations[item?.attribute_name]
                          ?.attribute_value_name
                      : "Select " + item?.attribute_name}
                  </span>
                </p>
                {/* Attribute values: Example: RED, GREEN */}
                <span className="flex items-center gap-y-1  flex-wrap ">
                  {item?.attribute_values?.map((value) => (
                    <div key={value?._id} className="relative group">
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectVariation(value, item?.attribute_name)
                        }
                        size="sm"
                        className={`px-2 py-1 ml-1.5   flex flex-wrap duration-200 border
                            ${
                              selectedVariations[item?.attribute_name]
                                ?.attribute_value_name ===
                              value?.attribute_value_name
                                ? "text-white bg-primary"
                                : " hover:bg-primary hover:text-white text-primary"
                            } 
                             ${
                               isHexColor(value?.attribute_value_code)
                                 ? `w-8 h-8 rounded-full text-transparent hover:text-transparent `
                                 : ""
                             } 
                             ${
                               isHexColor(value?.attribute_value_code) &&
                               selectedVariations[item?.attribute_name]
                                 ?.attribute_value_name ===
                                 value?.attribute_value_name
                                 ? "border border-primary "
                                 : " hover:border-primary hover:border"
                             } 
                           `}
                        style={{
                          backgroundColor: isHexColor(
                            value?.attribute_value_code
                          )
                            ? value?.attribute_value_code
                            : "",
                          // color:
                          // border:
                          //   selectedVariations[item?.attribute_name]
                          //     ?.attribute_value_name ===
                          //   value?.attribute_value_name
                          //     ? "3px solid  #AA0144" // Ensure primary color when selected
                          //     : isHexColor(value?.attribute_value_code)
                          //     ? value?.attribute_value_code
                          //     : "",
                        }}
                      >
                        {!isHexColor(value?.attribute_value_code) &&
                          value?.attribute_value_name}
                      </button>
                      {isHexColor(value?.attribute_value_code) && (
                        <span className="absolute left-1/2 -translate-x-1/2 -top-7 px-2 py-1 text-xs text-white bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap" >
                          {value?.attribute_value_name ||
                            value?.attribute_value_code}
                        </span>
                      )}
                    </div>
                  ))}
                </span>
              </div>
            </div>
          </section>
        ))}

      {product?.size_chart && (
        <>
          {" "}
          <button
            className="text-base mt-2 text-text-primary underline underline-offset-4 hover:text-blue-600"
            onClick={() => setShowChart(!showChart)}
            type="button"
          >
            Size Chart
          </button>
          {showChart && (
            <ChartModal
              showChart={showChart}
              setShowChart={setShowChart}
              size_chart={product?.size_chart}
            />
          )}
        </>
      )}

      {product?.is_variation ? (
        <>
          {stock > 0 ? (
            <p className=" text-gray-800 mt-6 ">
              Stocks :{" "}
              <span className="text-gray-800 font-bold text-[18px]">
                {stock}
              </span>
            </p>
          ) : (
            <p className=" text-secondary font-semibold mt-6 ">Out Of Stock</p>
          )}
        </>
      ) : (
        <p className=" text-gray-800 mt-2 ">
          Stocks :{" "}
          <span className="text-gray-800 font-bold text-[18px]">
            {product?.product_quantity}
          </span>
        </p>
      )}

      {/* <p className=" text-gray-800 mt-4 ">Stocks Available</p> */}
      <div>
        <div className="flex items-center my-4  gap-2.5 flex-wrap ">
          {/* <div className="flex">
            <button
              type="button"
              className="px-2 py-1.5  hover:bg-gray-200 bg-[#F2F2F2] border border-gray-200"
              onClick={handleDecrement}
            >
              <HiMinus className="text-gray-700" />
            </button>
            <input
              type="number"
              className="border border-gray-200 outline-primary text-gray-800  text-xs  no-spin-buttons text-center w-14 "
              value={quantity}
              onChange={(e) => {
                const newQuantity = parseInt(e.target.value);
                // Ensure the value is between 1 and the available stock
                if (!isNaN(newQuantity)) {
                  setQuantity(newQuantity);
                  // setQuantity(Math.max(1, Math.min(newQuantity, maxQuantity)));
                }
              }}
            />
            <button
              type="button"
              className="px-2 py-1.5  hover:bg-gray-200 bg-[#F2F2F2]  border border-gray-200"
              onClick={handleIncrement}
            >
              <HiOutlinePlus className="text-gray-700" />
            </button>
          </div> */}

          {stock > 0 && (
            <div className="flex">
              <button
                type="button"
                className="px-2 py-1.5  hover:bg-gray-200 bg-[#F2F2F2] border border-gray-200"
                onClick={handleDecrement}
              >
                <HiMinus className="text-gray-700" />
              </button>
              <input
                type="number"
                className="border border-gray-200 outline-primary text-gray-800  text-xs  no-spin-buttons text-center w-14 "
                value={quantity}
                onChange={(e) => {
                  const newQuantity = parseInt(e.target.value);
                  // Ensure the value is between 1 and the available stock
                  if (!isNaN(newQuantity)) {
                    setQuantity(
                      Math.max(1, Math.min(newQuantity, maxQuantity))
                    );
                  }
                }}
              />
              <button
                type="button"
                className="px-2 py-1.5  hover:bg-gray-200 bg-[#F2F2F2]  border border-gray-200"
                onClick={handleIncrement}
              >
                <HiOutlinePlus className="text-gray-700" />
              </button>
            </div>
          )}
          <button
            type="button"
            className={`text-xs px-2.5 py-2  
        ${isWishlisted ? "bg-primary text-white" : "bg-gray-100  "} 
        hover:opacity-90 transition-all duration-300 `}
            onClick={handleWishlist}
          >
            {isWishlisted ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
          </button>
        </div>
      </div>

      <div className="hidden  md:flex items-center gap-2  ">
        {/* <Button size="lg" type="button" onClick={handleAddToCart}>
          {" "}
          <BsCart />
          <span className="text-sm font-normal">Add To Cart</span>
        </Button> */}

        {stock <= 0 ? (
          <Button
            size="lg"
            type="button"
            disabled
            variant="secondary"
            className="opacity-50 w-full cursor-not-allowed "
          >
            <TbShoppingCartOff />
            <span className="text-sm font-normal">Add To Cart</span>
          </Button>
        ) : (
          <Button size="lg" type="button" onClick={handleAddToCart}>
            {" "}
            <BsCart />
            <span className="text-sm font-normal">Add To Cart</span>
          </Button>
        )}
      </div>
      <div className="md:hidden flex items-center gap-2 fixed bottom-[60px] z-10 w-full right-0 px-4">
        {/* <button
          size="lg"
          type="button"
          onClick={handleAddToCart}
          className="w-full flex items-center justify-center gap-2 bg-black text-white shadow hover:bg-primary/90 py-3  "
        >
          <BsCart />
          <span className="text-sm ">Add To Cart</span>
        </button> */}

        {stock <= 0 ? (
          <Button
            size="lg"
            type="button"
            disabled
            variant="secondary"
            className="opacity-50 w-full cursor-not-allowed "
          >
            <TbShoppingCartOff />
            <span className="text-sm font-normal">Add To Cart</span>
          </Button>
        ) : (
          <button
            size="lg"
            type="button"
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 bg-black text-white shadow hover:bg-primary/90 py-3  "
          >
            <BsCart />
            <span className="text-sm ">Add To Cart</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductHighlightSection;
