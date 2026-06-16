"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { addToCart } from "@/redux/feature/cart/cartSlice";

/**
 * Shared add-to-cart + wishlist behaviour for the boutique home sections, kept
 * byte-for-byte consistent with the canonical ProductCard so the storefront
 * behaves the same everywhere (localStorage wishlist — edge-audit B1; variation
 * products open QuickView instead of a blind add — B2).
 *
 * Returns:
 *   wishlisted   — boolean (live, listens to the global localStorage event)
 *   toggleWishlist(e)
 *   addOrQuickView(e)  — simple product → addToCart; variation → setQuickView(true)
 *   quickView, setQuickView  — caller renders <QuickViewModal> when true
 */
export default function useBoutiqueProductActions(product) {
  const dispatch = useDispatch();
  const [quickView, setQuickView] = useState(false);

  const readWishlisted = () => {
    try {
      return (JSON.parse(localStorage.getItem("wishlist")) || []).some(
        (i) => i.productId === product?._id,
      );
    } catch {
      return false;
    }
  };

  const [wishlisted, setWishlisted] = useState(false);

  // Hydrate on mount (avoids SSR/client mismatch — edge-audit H3) and stay in
  // sync if another card toggles the same product.
  useEffect(() => {
    setWishlisted(readWishlisted());
    const onUpdate = () => setWishlisted(readWishlisted());
    window.addEventListener("localStorageUpdated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("localStorageUpdated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id]);

  const toggleWishlist = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    try {
      const list = JSON.parse(localStorage.getItem("wishlist")) || [];
      const firstVarId = Array.isArray(product?.variations)
        ? product.variations[0]?._id
        : product?.variations?._id;
      const item = {
        productId: product?._id,
        variation_product_id: firstVarId || null,
      };
      const exists = list.some((i) => i.productId === item.productId);
      const updated = exists
        ? list.filter((i) => i.productId !== item.productId)
        : [...list, item];
      localStorage.setItem("wishlist", JSON.stringify(updated));
      window.dispatchEvent(new Event("localStorageUpdated"));
      setWishlisted(!exists);
      toast[exists ? "error" : "success"](
        exists ? "উইশলিস্ট থেকে সরানো হয়েছে" : "উইশলিস্টে যোগ হয়েছে",
        { autoClose: 1200 },
      );
    } catch {}
  };

  const addOrQuickView = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (product?.is_variation) {
      setQuickView(true);
      return;
    }
    dispatch(
      addToCart({
        productId: product?._id,
        variation_product_id: null,
        quantity: 1,
        product_slug: product?.product_slug || null,
      }),
    );
    toast.success("কার্টে যোগ হয়েছে", { autoClose: 1200 });
  };

  return { wishlisted, toggleWishlist, addOrQuickView, quickView, setQuickView };
}
