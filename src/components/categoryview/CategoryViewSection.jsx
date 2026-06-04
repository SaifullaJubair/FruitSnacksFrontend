"use client";
import { titleFont } from "@/utils/font";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { BsFilterLeft } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import { RiHome2Line } from "react-icons/ri";
import NotFoundData from "../common/NotFoundData";
import PaginationWithPageBtn from "../common/paginationWithPageBtn/PaginationWithPageBtn";
import ProductSkeleton from "../shared/loader/ProductSkeleton";
import { BASE_URL } from "../utils/baseURL";
import CategoryViewCard from "./CategoryViewCard";
import FilterSection from "./FilterSection";

// Fix #26/#27 — URL-state persistence + Reset + Sort dropdown, with
// HUMAN-READABLE URLs and English UI copy.
//
// URL examples this writes:
//   ?color=jet-black,matte-black&size=m&av=in-stock&brand=bata&sort=price-low-high
// instead of:
//   ?f_6984f...=6984f...&f_6a169...=6a169...&av=1&b=bata&sort=price_asc
//
// The mapping from attribute/value slug → ObjectId happens against
// `filterData.attributes` which the parent already fetched for the sidebar.
// If a slug isn't found in that pool (stale link, attribute deleted) we
// silently skip it instead of crashing.
const DEFAULT_MIN = 1;
const DEFAULT_MAX = 5000;

const AVAILABILITY_SLUGS = { "in-stock": 1, "out-of-stock": 0 };
const AVAILABILITY_TO_SLUG = { 1: "in-stock", 0: "out-of-stock" };

const SORT_OPTIONS = [
  { value: "latest", label: "Latest", slug: "latest" },
  { value: "price_asc", label: "Price: Low to High", slug: "price-low-high" },
  { value: "price_desc", label: "Price: High to Low", slug: "price-high-low" },
  { value: "popular", label: "Most Popular", slug: "popular" },
  { value: "rating", label: "Highest Rated", slug: "rating" },
];
const SORT_BY_SLUG = Object.fromEntries(SORT_OPTIONS.map((o) => [o.slug, o.value]));
const SORT_TO_SLUG = Object.fromEntries(SORT_OPTIONS.map((o) => [o.value, o.slug]));

// Build slug → id maps for the current filterData snapshot.
const buildSlugMaps = (filterData) => {
  const attrSlugToId = new Map();
  const attrIdToSlug = new Map();
  const valueSlugToId = new Map(); // key: `${attrSlug}|${valSlug}` → valId
  const valueIdToSlug = new Map(); // key: `${attrId}|${valId}` → valSlug
  for (const attr of filterData?.attributes || []) {
    if (!attr?.attribute_slug || !attr?._id) continue;
    attrSlugToId.set(attr.attribute_slug, String(attr._id));
    attrIdToSlug.set(String(attr._id), attr.attribute_slug);
    for (const v of attr.attribute_values || []) {
      if (!v?.attribute_value_slug || !v?._id) continue;
      valueSlugToId.set(`${attr.attribute_slug}|${v.attribute_value_slug}`, String(v._id));
      valueIdToSlug.set(`${String(attr._id)}|${String(v._id)}`, v.attribute_value_slug);
    }
  }
  return { attrSlugToId, attrIdToSlug, valueSlugToId, valueIdToSlug };
};

const readFiltersFromUrl = (sp, maps) => {
  const out = {
    filters: {},
    min_price: DEFAULT_MIN,
    max_price: DEFAULT_MAX,
    availability: [],
    brands: [],
  };
  if (!sp) return out;
  // Walk every searchParam: if its key matches an attribute_slug we know
  // about, treat the value as a comma-separated list of value_slugs.
  for (const [key, value] of sp.entries()) {
    if (["min", "max", "av", "brand", "sort", "page"].includes(key)) continue;
    const attrId = maps.attrSlugToId.get(key);
    if (!attrId) continue;
    const valIds = value
      .split(",")
      .map((slug) => maps.valueSlugToId.get(`${key}|${slug}`))
      .filter(Boolean);
    if (valIds.length) out.filters[attrId] = valIds;
  }
  const minP = Number(sp.get("min"));
  const maxP = Number(sp.get("max"));
  if (Number.isFinite(minP) && minP > 0) out.min_price = minP;
  if (Number.isFinite(maxP) && maxP > 0) out.max_price = maxP;
  const av = sp.get("av");
  if (av) {
    out.availability = av
      .split(",")
      .map((s) => AVAILABILITY_SLUGS[s])
      .filter((n) => n === 0 || n === 1);
  }
  const br = sp.get("brand");
  if (br) out.brands = br.split(",").filter(Boolean);
  return out;
};

const writeFiltersToUrl = (filters, sort, page, maps) => {
  const params = new URLSearchParams();
  for (const [attrId, vals] of Object.entries(filters?.filters || {})) {
    if (!Array.isArray(vals) || !vals.length) continue;
    const attrSlug = maps.attrIdToSlug.get(String(attrId));
    if (!attrSlug) continue;
    const valSlugs = vals
      .map((vid) => maps.valueIdToSlug.get(`${attrId}|${vid}`))
      .filter(Boolean);
    if (valSlugs.length) params.set(attrSlug, valSlugs.join(","));
  }
  if (filters?.min_price && filters.min_price !== DEFAULT_MIN)
    params.set("min", String(filters.min_price));
  if (filters?.max_price && filters.max_price !== DEFAULT_MAX)
    params.set("max", String(filters.max_price));
  if (filters?.availability?.length) {
    const slugs = filters.availability
      .map((n) => AVAILABILITY_TO_SLUG[n])
      .filter(Boolean);
    if (slugs.length) params.set("av", slugs.join(","));
  }
  if (filters?.brands?.length) params.set("brand", filters.brands.join(","));
  if (sort && sort !== "latest") {
    const slug = SORT_TO_SLUG[sort];
    if (slug) params.set("sort", slug);
  }
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

const CategoryViewSection = ({ slug, filterData, filterHeadData }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Build maps once per filterData change. Refs avoid re-creating on every
  // render — they only matter when filterData changes (which is rare).
  const maps = useMemo(() => buildSlugMaps(filterData), [filterData]);

  // Seed everything from the URL on first render.
  const [rows, setRows] = useState(20);
  const [page, setPage] = useState(() => {
    const p = Number(searchParams?.get("page"));
    return Number.isFinite(p) && p > 0 ? p : 1;
  });
  const [selectedFilters, setSelectedFilters] = useState(() =>
    readFiltersFromUrl(searchParams, maps),
  );
  const [selectedSort, setSelectedSort] = useState(() => {
    const slug = searchParams?.get("sort");
    return SORT_BY_SLUG[slug] || "latest";
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState("");
  const [viewProduct, setViewProduct] = useState(null);
  const [, setDefaultsProducts] = useState([]);

  // Re-seed once maps are known (initial render may run before filterData
  // arrives; URL params for attribute slugs need the map to resolve).
  const reSeededRef = useRef(false);
  useEffect(() => {
    if (reSeededRef.current) return;
    if (!filterData?.attributes?.length) return;
    reSeededRef.current = true;
    setSelectedFilters(readFiltersFromUrl(searchParams, maps));
  }, [filterData, maps, searchParams]);

  // Write back to URL whenever filters/sort/page change. Skip the very first
  // run (which is just hydration from the URL itself).
  const isFirstSync = useRef(true);
  useEffect(() => {
    if (isFirstSync.current) {
      isFirstSync.current = false;
      return;
    }
    const qs = writeFiltersToUrl(selectedFilters, selectedSort, page, maps);
    router.replace(`${pathname}${qs}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilters, selectedSort, page]);

  const handleResetFilters = () => {
    setSelectedFilters({
      filters: {},
      min_price: DEFAULT_MIN,
      max_price: DEFAULT_MAX,
      availability: [],
      brands: [],
    });
    setSelectedSort("latest");
    setPage(1);
    router.replace(pathname, { scroll: false });
  };

  const hasActiveFilters = useMemo(() => {
    const f = selectedFilters || {};
    if (Object.keys(f.filters || {}).length > 0) return true;
    if (f.min_price && f.min_price !== DEFAULT_MIN) return true;
    if (f.max_price && f.max_price !== DEFAULT_MAX) return true;
    if (f.availability?.length) return true;
    if (f.brands?.length) return true;
    if (selectedSort && selectedSort !== "latest") return true;
    return false;
  }, [selectedFilters, selectedSort]);

  const queryString = encodeURIComponent(JSON.stringify(selectedFilters));

  const safeSlug = Array.isArray(slug) ? slug : [];
  const leafSlug = safeSlug[safeSlug.length - 1];

  const { data, isLoading } = useQuery({
    queryKey: [selectedFilters, slug, page, rows],
    queryFn: async () => {
      const res = await fetch(
        `${BASE_URL}/filter_product?categoryType=${leafSlug}&filterData=${queryString}&page=${page}&limit=${rows}`,
      );
      const data = await res.json();
      setDefaultsProducts(data);
      return data;
    },
  });

  const openModal = () => {
    setModalOpen(true);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const sortedData = useMemo(() => {
    if (!data?.data) return [];
    const list = [...data.data];
    const effectivePrice = (p) =>
      p?.is_variation && p?.variations?.variation_price
        ? Number(p.variations.variation_price)
        : Number(p?.product_price || 0);
    switch (selectedSort) {
      case "price_asc":
        return list.sort((a, b) => effectivePrice(a) - effectivePrice(b));
      case "price_desc":
        return list.sort((a, b) => effectivePrice(b) - effectivePrice(a));
      case "popular":
        return list.sort(
          (a, b) => (b?.sold_count || 0) - (a?.sold_count || 0),
        );
      case "rating":
        return list.sort(
          (a, b) =>
            (b?.average_review_rating || 0) - (a?.average_review_rating || 0),
        );
      case "latest":
      default:
        return list.sort(
          (a, b) =>
            new Date(b?.createdAt || 0).getTime() -
            new Date(a?.createdAt || 0).getTime(),
        );
    }
  }, [data, selectedSort]);
  const startIndex = (page - 1) * rows + 1;
  const endIndex = startIndex + Number(rows) - 1;

  return (
    <div className="">
      <h2
        className="text-2xl sm:text-3xl mt-4 font-bold text-center md:text-start text-gray-800"
        style={{
          fontFamily: titleFont.style.fontFamily,
        }}
      >
        <span className="capitalize ">{safeSlug[0] || "Category"}</span>{" "}
      </h2>

      <div className="bg-white py-2.5  mb-2 flex flex-wrap gap-1">
        {filterHeadData?.map((item) => (
          <Link
            key={item._id}
            href={`/category/${[...slug, item?.category_slug]
              .filter(Boolean)
              .join("/")}`}
            className=" px-3 py-[1px] bg-gray-50 border border-gray-400 shadow-sm hover:bg-gray-100"
          >
            <span className="text-primary text-base">
              {item?.category_name}
            </span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-2.5">
        <div className="hidden lg:block">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full mb-2 px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 text-sm font-medium rounded transition-colors"
            >
              ✕ Reset All Filters
            </button>
          )}
          <FilterSection
            slug={slug}
            filterData={filterData}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
          />
        </div>
        <div className="col-span-5 lg:col-span-4">
          <div className="bg-white py-1.5 px-4 mb-4   shadow flex justify-between items-center flex-wrap gap-2">
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
                href={`/category/${safeSlug[0]}`}
              >
                {safeSlug[0]}
              </Link>
              {safeSlug[1] && (
                <>
                  <span className="mx-1">/</span>{" "}
                  <Link
                    className="hover:underline underline-offset-2 "
                    href={`/category/${safeSlug[0]}/${safeSlug[1]}`}
                  >
                    {safeSlug[1]}
                  </Link>{" "}
                </>
              )}
              {safeSlug[2] && (
                <>
                  <span className="mx-1">/</span>{" "}
                  <Link
                    className="hover:underline underline-offset-2 "
                    href={`/category/${safeSlug[0]}/${safeSlug[1]}/${safeSlug[2]}`}
                  >
                    {" "}
                    {safeSlug[2]}{" "}
                  </Link>{" "}
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <label
                htmlFor="sort-select"
                className="text-xs md:text-sm text-gray-600"
              >
                Sort:
              </label>
              <select
                id="sort-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="text-xs md:text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
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
                  {sortedData?.map((product) => (
                    <CategoryViewCard
                      key={product?._id}
                      product={product}
                      openModal={openModal}
                      setViewProduct={setViewProduct}
                      activeFilters={selectedFilters?.filters}
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
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full mb-2 px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 text-sm font-medium rounded transition-colors"
            >
              ✕ Reset All Filters
            </button>
          )}
          <FilterSection
            slug={slug}
            filterData={filterData}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryViewSection;
