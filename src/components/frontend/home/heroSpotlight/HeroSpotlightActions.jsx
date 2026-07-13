"use client";

import { FiHeart, FiShoppingCart, FiEye } from "react-icons/fi";
import QuickViewModal from "@/components/shared/quickViewModal/QuickViewModal";
import { MotionButton } from "../boutique/bits";
import useBoutiqueProductActions from "../boutique/useBoutiqueProductActions";

/**
 * Client leaf for HeroSpotlight — cart / wishlist / quick-view only.
 *
 * The parent (HeroSpotlight) is a Server Component and renders the LCP <Image>
 * itself, so the image URL is in the initial HTML. Everything that genuinely
 * needs the browser (Redux dispatch, localStorage wishlist, router.push) lives
 * here and receives `product` as a plain prop — it fetches nothing.
 */
export default function HeroSpotlightActions({ product }) {
  const actions = useBoutiqueProductActions(product);

  // No inline variation picker in the hero, so a variation product opens
  // QuickView (to pick a pack size); a simple product acts directly.
  const onCart = () =>
    product.is_variation ? actions.setQuickView(true) : actions.handleAddToCart(null);
  const onBuyNow = () =>
    product.is_variation ? actions.setQuickView(true) : actions.buyNow(null);

  return (
    <>
      <div className="flex items-center gap-2.5 pt-2">
        <MotionButton
          onClick={onCart}
          aria-label="কার্টে যোগ করুন"
          title="কার্টে যোগ করুন"
          className="inline-flex items-center justify-center gap-2 h-12 w-12 sm:w-auto sm:px-4 rounded-full border border-gray-200 bg-white text-gray-600 hover:text-primary-600 hover:border-primary-400 transition-colors text-sm font-medium"
        >
          <FiShoppingCart className="shrink-0" />
          <span className="hidden sm:inline">কার্ট</span>
        </MotionButton>
        <MotionButton
          onClick={actions.toggleWishlist}
          aria-label="উইশলিস্ট"
          title="উইশলিস্ট"
          className={`inline-flex items-center justify-center gap-2 h-12 w-12 sm:w-auto sm:px-4 rounded-full border transition-colors text-sm font-medium ${
            actions.wishlisted
              ? "bg-red-50 border-red-200 text-red-500"
              : "bg-white border-gray-200 text-gray-500 hover:text-red-500"
          }`}
        >
          <FiHeart className={`shrink-0 ${actions.wishlisted ? "fill-current" : ""}`} />
          <span className="hidden sm:inline">উইশলিস্ট</span>
        </MotionButton>
        <MotionButton
          onClick={() => actions.setQuickView(true)}
          aria-label="দ্রুত দেখুন"
          title="দ্রুত দেখুন"
          className="inline-flex items-center justify-center gap-2 h-12 w-12 sm:w-auto sm:px-4 rounded-full border border-gray-200 bg-white text-gray-600 hover:text-primary-600 hover:border-primary-400 transition-colors text-sm font-medium"
        >
          <FiEye className="shrink-0" />
          <span className="hidden sm:inline">দেখুন</span>
        </MotionButton>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <MotionButton
          onClick={onBuyNow}
          className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-8 py-3.5 rounded-full font-semibold transition-colors shadow-lg shadow-primary-500/25"
        >
          এখনই অর্ডার করুন
        </MotionButton>
      </div>

      {actions.quickView && (
        <QuickViewModal product={product} onClose={() => actions.setQuickView(false)} />
      )}
    </>
  );
}
