"use client";
import { useState } from "react";
import ReactSlider from "react-slider";
import { numberWithCommas } from "../utils/numberWithComa";

const PriceRangeFilter = ({ onChange, filterData }) => {
  const [priceRange, setPriceRange] = useState([
    1,
    // filterData?.maxPriceRange ? filterData?.maxPriceRange : 5000,
    5000,
  ]);

  const handlePriceChange = (newRange) => {
    setPriceRange(newRange);
    onChange({ min: newRange[0], max: newRange[1] });
  };

  return (
    <div className="flex flex-col gap-5 items-center ">
      <ReactSlider
        min={1}
        max={5000}
        // max={filterData?.maxPriceRange ? filterData?.maxPriceRange : 5000}
        step={1}
        value={priceRange}
        onChange={handlePriceChange}
        className="w-full"
        trackClassName="track"
        thumbClassName="thumb"
      />
      <div className="flex items-center justify-between space-x-2 mt-2">
        <span className="px-2 border border-primary text-base lg:text-lg">
          {numberWithCommas(priceRange[0])}
        </span>
        <span>-</span>
        <span className="px-2 border border-primary text-base lg:text-lg">
          {numberWithCommas(priceRange[1])}
        </span>
      </div>
    </div>
  );
};

export default PriceRangeFilter;
