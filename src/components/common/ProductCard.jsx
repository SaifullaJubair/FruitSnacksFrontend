"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";
import { FiHeart, FiShoppingCart, FiEye } from "react-icons/fi";
import { isHexColor, lineThroughPrice, productPrice } from "@/utils/helper";
import useGetSettingData from "@/components/lib/getSettingData";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/feature/cart/cartSlice";
import QuickViewModal from "@/components/shared/quickViewModal/QuickViewModal";

/**
 * Shared product card used across all sections.
 *
 * Props:
 *   product       — product object from API
 *   badge         — optional string pill in top-right (e.g. "New")
 *   activeFilters — optional { [attrId]: [valueId, ...] } from category page
 *                   used to build filter-aware PDP URLs
 */
const ProductCard = ({ product, badge, activeFilters }) => {
  const { data: settingsData } = useGetSettingData();
  const currencySymbol = settingsData?.data?.[0]?.currency_symbol;
  const dispatch = useDispatch();

  const [wishlisted, setWishlisted] = useState(() => {
    try {
      return (JSON.parse(localStorage.getItem("wishlist")) || []).some(
        (i) => i.productId === product?._id,
      );
    } catch { return false; }
  });
  const [quickView, setQuickView] = useState(false);

  const price = productPrice(product);
  const origPrice = lineThroughPrice(product);
  const discount = origPrice ? Math.round(((origPrice - price) / origPrice) * 100) : 0;

  // Color swatches
  const colors = Array.isArray(product?.attributes_details)
    ? product.attributes_details.flatMap((a) => a.attribute_values || []).filter((v) => isHexColor(v?.attribute_value_code))
    : (product?.attributes_details?.attribute_values || []).filter((v) => isHexColor(v?.attribute_value_code));

  // Hover image — variations and other_images are arrays
  const firstVariationImg = Array.isArray(product?.variations)
    ? product.variations[0]?.variation_image
    : product?.variations?.variation_image;
  const firstOtherImg = Array.isArray(product?.other_images)
    ? product.other_images[0]?.other_image
    : product?.other_images?.other_image;
  const hoverImg = product?.is_variation ? firstVariationImg || null : firstOtherImg || null;

  const hasVideo = Boolean(product?.main_video);
  const showCrossfade = !hasVideo && hoverImg && hoverImg !== product?.main_image;

  // Build PDP href — category page can pass activeFilters to pre-select a variant
  const buildHref = () => {
    const base = `/products/${product?.product_slug}`;
    if (!activeFilters || !product?.attributes_details?.length) return base;
    const params = new URLSearchParams();
    for (const [attrId, valueIds] of Object.entries(activeFilters)) {
      if (!Array.isArray(valueIds) || !valueIds.length) continue;
      const attr = product.attributes_details.find((a) => String(a?._id) === String(attrId));
      if (!attr) continue;
      const picked = valueIds.find((vid) =>
        attr.attribute_values?.some((av) => String(av?._id) === String(vid)),
      );
      if (picked) params.set(String(attrId), String(picked));
    }
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };

  const href = buildHref();

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const list = JSON.parse(localStorage.getItem("wishlist")) || [];
      const firstVarId = Array.isArray(product?.variations)
        ? product.variations[0]?._id
        : product?.variations?._id;
      const item = { productId: product?._id, variation_product_id: firstVarId || null };
      const exists = list.some((i) => i.productId === item.productId);
      const updated = exists
        ? list.filter((i) => i.productId !== item.productId)
        : [...list, item];
      localStorage.setItem("wishlist", JSON.stringify(updated));
      window.dispatchEvent(new Event("localStorageUpdated"));
      setWishlisted(!exists);
      toast[exists ? "error" : "success"](
        exists ? "Removed from wishlist" : "Added to wishlist",
        { autoClose: 1200 },
      );
    } catch {}
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product?.is_variation) {
      window.location.href = href;
      return;
    }
    dispatch(
      addToCart({
        productId: product?._id,
        variation_product_id: null,
        quantity: 1,
        product_slug: product?.product_slug || null,
        maxStock: product?.product_quantity, // F1.2 — clamp repeat-adds to stock
      }),
    );
    toast.success("Added to cart", { autoClose: 1200 });
  };

  return (
    <>
      <div className="group bg-white rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">

        {/* ── Image area ── */}
        <Link href={href} className="block relative overflow-hidden bg-gray-50 aspect-[3/4] shrink-0">

          {/* Base: video stays visible always, image can crossfade */}
          {hasVideo ? (
            <video
              src={product.main_video}
              autoPlay loop muted playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <Image
              fill
              src={product?.main_image || "/assets/images/placeholder.jpg"}
              alt={product?.product_name || "Product"}
              className={`object-cover transition-all duration-500 ${
                showCrossfade ? "group-hover:opacity-0" : "group-hover:scale-105"
              }`}
            />
          )}

          {/* Crossfade hover image — only when no video and a different image exists */}
          {showCrossfade && (
            <Image
              fill
              src={hoverImg}
              alt={product?.product_name || "Product"}
              className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
          )}

          {/* Discount badge — top left */}
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
              -{discount}%
            </span>
          )}

          {/* Badge + wishlist — top right, stacked */}
          <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1">
            {badge && (
              <span className="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                {badge}
              </span>
            )}
            <button
              type="button"
              onClick={handleWishlist}
              className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 ${
                wishlisted
                  ? "bg-red-50 text-red-500"
                  : "bg-white/90 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-400"
              }`}
            >
              <FiHeart size={12} fill={wishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Bottom action bar — slides up on hover */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10 flex">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 bg-primary text-white text-[11px] font-semibold py-2.5 flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors"
            >
              <FiShoppingCart size={12} />
              {product?.is_variation ? "Choose Options" : "Add to Cart"}
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickView(true); }}
              className="bg-gray-800 text-white px-3 py-2.5 flex items-center justify-center hover:bg-gray-700 transition-colors border-l border-gray-700"
              title="Quick view"
            >
              <FiEye size={13} />
            </button>
          </div>
        </Link>

        {/* ── Info ── */}
        <div className="p-3 flex flex-col gap-1.5 flex-1">
          <Link href={href}>
            <h3 className="text-xs sm:text-sm text-gray-800 font-medium line-clamp-2 leading-snug hover:text-primary transition-colors min-h-[2.5rem]">
              {product?.product_name}
            </h3>
          </Link>

          {/* Color swatches */}
          {colors?.length > 0 && (
            <div className="flex items-center gap-1">
              {colors.slice(0, 5).map((c) => (
                <span
                  key={c?._id}
                  className="w-3.5 h-3.5 rounded-full border border-gray-200 shrink-0"
                  style={{ backgroundColor: c?.attribute_value_code }}
                  title={c?.attribute_value_name}
                />
              ))}
              {colors.length > 5 && (
                <span className="text-[10px] text-gray-400">+{colors.length - 5}</span>
              )}
            </div>
          )}

          {/* Price row */}
          <div className="flex items-center gap-2 mt-auto pt-1 flex-wrap">
            <span className="text-sm font-bold text-gray-900">
              {currencySymbol}{price}
            </span>
            {origPrice && (
              <span className="text-xs line-through text-gray-400">
                {currencySymbol}{origPrice}
              </span>
            )}
            {discount > 0 && (
              <span className="ml-auto text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                Save {discount}%
              </span>
            )}
          </div>
        </div>
      </div>

      {quickView && (
        <QuickViewModal product={product} onClose={() => setQuickView(false)} />
      )}
    </>
  );
};

export default ProductCard;
