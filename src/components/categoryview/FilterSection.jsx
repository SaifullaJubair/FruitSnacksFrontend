"use client";
import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import PriceRangeFilter from "./PriceRangFilter";
import { availabilityFilterData, brandFilterData } from "@/data/filter-data";

const FilterSection = ({
  slug,
  selectedFilters,
  setSelectedFilters,
  filterData,
}) => {
  // Per-attribute open/close map keyed by attribute slot index.
  const [openFilters, setOpenFilters] = useState({
    price: true,
    availability: true,
    brand: true,
    attributes: {},
  });

  // Toggle Filter Open/Close
  const toggleFilter = (filterKey) => {
    setOpenFilters((prev) => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  };

  const toggleAttributeFilter = (filterKey) => {
    setOpenFilters((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [filterKey]: !prev.attributes[filterKey],
      },
    }));
  };

  // Handle Filter Click
  const handleFilterClick = (filterId, childFilterId) => {
    setSelectedFilters((prevSelectedFilters) => {
      // Fix #25 — guard for legacy initial filters=[] shape (array, not
      // object). Coerce to object map every time so the toggle works whether
      // the initial state was [] or {}.
      const filtersMap =
        prevSelectedFilters.filters &&
        !Array.isArray(prevSelectedFilters.filters)
          ? prevSelectedFilters.filters
          : {};
      const prevSelectedChildFilters = filtersMap[filterId] || [];

      const updatedChildFilters = prevSelectedChildFilters.includes(
        childFilterId
      )
        ? prevSelectedChildFilters.filter((id) => id !== childFilterId)
        : [...prevSelectedChildFilters, childFilterId];

      const updatedFilters = {
        ...filtersMap,
        [filterId]: updatedChildFilters,
      };

      // Remove empty filters
      for (const propName in updatedFilters) {
        if (
          Array.isArray(updatedFilters[propName]) &&
          updatedFilters[propName].length === 0
        ) {
          delete updatedFilters[propName];
        }
      }

      return {
        ...prevSelectedFilters,
        filters: updatedFilters,
      };
    });
  };

  const handleSetPrice = (value) => {
    setSelectedFilters((prevSelectedFilters) => ({
      ...prevSelectedFilters,
      min_price: value?.min,
      max_price: value?.max,
    }));
  };

  const handleSetAvailability = (value) => {
    setSelectedFilters((prevSelectedFilters) => ({
      ...prevSelectedFilters,
      availability: prevSelectedFilters.availability.includes(value)
        ? prevSelectedFilters.availability.filter((item) => item !== value)
        : [...prevSelectedFilters.availability, value],
    }));
  };

  const handleSetBrands = (value) => {
    setSelectedFilters((prevSelectedFilters) => ({
      ...prevSelectedFilters,
      brands: prevSelectedFilters.brands.includes(value)
        ? prevSelectedFilters.brands.filter((item) => item !== value)
        : [...prevSelectedFilters.brands, value],
    }));
  };

  return (
    <div className="space-y-2">
      {/* ✅ Price Range Filter */}
      <div className="border   bg-white">
        <div
          className={`flex cursor-pointer items-center justify-between px-4 py-3   hover:bg-gray-100 ${
            openFilters.price ? " border-b-2" : "border-b-0"
          }`}
          onClick={() => toggleFilter("price")}
        >
          <p className="text-sm font-medium">Price Range</p>
          <IoIosArrowDown
            className={`w-5 h-5 transition-transform ${
              openFilters.price ? "rotate-180" : ""
            }`}
          />
        </div>
        <div
          className={`transition-all duration-300 overflow-hidden ${
            openFilters.price ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 py-5 ">
            <PriceRangeFilter
              onChange={handleSetPrice}
              filterData={filterData}
              initialMin={selectedFilters?.min_price}
              initialMax={selectedFilters?.max_price}
            />
          </div>
        </div>
      </div>

      {/* ✅ Availability Filter */}
      <div className="border   bg-white">
        {availabilityFilterData?.map((filter, i) => (
          <div key={i}>
            <div
              className={`flex cursor-pointer items-center justify-between px-4 py-3  hover:bg-gray-100 ${
                openFilters.availability ? " border-b-2" : "border-b-0"
              }`}
              onClick={() => toggleFilter("availability")}
            >
              <p className="text-sm font-medium"> {filter?.filter_name}</p>
              <IoIosArrowDown
                className={`w-5 h-5 transition-transform ${
                  openFilters.availability ? "rotate-180" : ""
                }`}
              />
            </div>
            <div
              className={`transition-all duration-300 overflow-hidden ${
                openFilters.availability
                  ? "max-h-60 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-4 py-2  space-y-2">
                {filter?.child_filters?.map((childFilter) => (
                  <div
                    key={childFilter?.child_filter_name}
                    className="flex gap-x-2"
                  >
                    <input
                      value={childFilter?.child_filter_name}
                      type="checkbox"
                      className="text-xl"
                      checked={selectedFilters?.availability?.includes(
                        childFilter?.value
                      )}
                      onChange={() => handleSetAvailability(childFilter?.value)}
                    />
                    <span>{childFilter?.child_filter_name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filterData?.brands?.length > 0 && (
        <div className="border bg-white   ">
          {brandFilterData?.map((filter, i) => (
            <div key={i}>
              <div
                className={`flex cursor-pointer items-center justify-between px-4 py-3  hover:bg-gray-100" ${
                  openFilters.brand ? " border-b-2" : "border-b-0"
                }`}
                onClick={() => toggleFilter("brand")}
              >
                <p className="text-sm font-medium"> {filter?.filter_name}</p>
                <IoIosArrowDown
                  className={`w-5 h-5 transition-transform ${
                    openFilters.brand ? "rotate-180" : ""
                  }`}
                />
              </div>
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  openFilters.brand
                    ? "max-h-60 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-4  py-2 space-y-2 max-h-40 overflow-y-auto">
                  {filterData?.brands?.map((brand) => (
                    <div key={brand?._id} className="flex gap-x-2">
                      <input
                        value={brand?.brand_slug}
                        type="checkbox"
                        className="text-xl"
                        checked={selectedFilters?.brands?.includes(
                          brand?.brand_slug
                        )}
                        onChange={() => handleSetBrands(brand?.brand_slug)}
                      />
                      <span>{brand?.brand_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* ✅ Specifications Filter */}
      {filterData?.attributes?.length > 0 && (
        <div className="space-y-2">
          {filterData?.attributes?.map((item, i) => (
            <div key={i} className="border   bg-white">
              <div
                className={`flex cursor-pointer items-center justify-between px-4 py-3  hover:bg-gray-100 ${
                  openFilters.attributes[`spec-${i}`]
                    ? " border-b-2"
                    : "border-b-0"
                }`}
                onClick={() => toggleAttributeFilter(`spec-${i}`)}
              >
                <p className="text-sm font-medium">
                  {item?.attribute_name}
                </p>
                <IoIosArrowDown
                  className={`w-5 h-5 transition-transform ${
                    openFilters.attributes[`spec-${i}`] ? "rotate-180" : ""
                  }`}
                />
              </div>
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  openFilters.attributes[`spec-${i}`]
                    ? "max-h-60 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-4 py-2  space-y-2 max-h-40 overflow-y-auto">
                  {item?.attribute_values?.map((childFilter) => {
                    // Fix #25 — was missing `checked` prop. With URL-driven
                    // state (Fix #26 below), the checkbox must reflect the
                    // current selection so refresh / back-navigation keeps the
                    // UI in sync with the query string.
                    const filtersMap = selectedFilters?.filters || {};
                    const isChecked = (filtersMap[item?._id] || []).includes(
                      childFilter?._id,
                    );
                    return (
                      <label
                        key={childFilter?._id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            handleFilterClick(item?._id, childFilter?._id)
                          }
                        />
                        <span>{childFilter?.attribute_value_name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterSection;
