"use client";

import { useCallback } from "react";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

// Unique event_id generate করো — browser + server deduplication এর জন্য
export const generateEventId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// fbq safely call করো
const fbq = (...args) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq(...args);
  }
};

const useMetaPixel = () => {
  // PageView
  const trackPageView = useCallback(() => {
    fbq("track", "PageView");
  }, []);

  // ViewContent — product details page
  const trackViewContent = useCallback((product, eventId) => {
    fbq(
      "track",
      "ViewContent",
      {
        content_ids: [product?._id],
        content_name: product?.product_name,
        content_type: "product",
        currency: "BDT",
        value: product?.product_discount_price || product?.product_price,
      },
      { eventID: eventId },
    );
  }, []);

  // AddToCart
  const trackAddToCart = useCallback(
    (product, variationProduct, quantity, eventId) => {
      const price = variationProduct
        ? variationProduct?.variation_discount_price ||
          variationProduct?.variation_price
        : product?.product_discount_price || product?.product_price;

      fbq(
        "track",
        "AddToCart",
        {
          content_ids: [variationProduct?._id || product?._id],
          content_name: product?.product_name,
          content_type: "product",
          currency: "BDT",
          value: price * quantity,
          num_items: quantity,
        },
        { eventID: eventId },
      );
    },
    [],
  );

  // Purchase
  const trackPurchase = useCallback((orderData, eventId) => {
    fbq(
      "track",
      "Purchase",
      {
        content_ids: orderData?.order_products?.map((p) => p?.product_id),
        content_type: "product",
        currency: "BDT",
        value: orderData?.grand_total_amount,
        num_items: orderData?.order_products?.length,
      },
      { eventID: eventId },
    );
  }, []);

  // Login
  const trackLogin = useCallback((eventId) => {
    fbq("track", "Login", {}, { eventID: eventId });
  }, []);

  // CompleteRegistration
  const trackCompleteRegistration = useCallback((eventId) => {
    fbq("track", "CompleteRegistration", {}, { eventID: eventId });
  }, []);

  return {
    trackPageView,
    trackViewContent,
    trackAddToCart,
    trackPurchase,
    trackLogin,
    trackCompleteRegistration,
  };
};

export default useMetaPixel;
