"use client";

// src/components/analyticsScripts/utils/tiktokPixel/useTikTokPixel.js
// Meta Pixel এর useMetaPixel এর মতোই — সব browser events এখানে

import { useCallback } from "react";
import { ttq } from "@/components/frontend/tiktokPixel/TikTokPixelScript";

// ✅ value সব সময় Number
const toNumber = (val) => parseFloat(val) || 0;

const useTikTokPixel = () => {
  // ViewContent — product details page
  const trackViewContent = useCallback((product, eventId) => {
    ttq(
      "track",
      "ViewContent",
      {
        content_id: String(product?._id),
        content_name: product?.product_name,
        content_type: "product",
        currency: "BDT",
        value: toNumber(
          product?.product_discount_price || product?.product_price,
        ),
      },
      { event_id: eventId },
    );
  }, []);

  // AddToCart
  const trackAddToCart = useCallback(
    (product, variationProduct, quantity, eventId) => {
      const price = variationProduct
        ? variationProduct?.variation_discount_price ||
          variationProduct?.variation_price
        : product?.product_discount_price || product?.product_price;

      ttq(
        "track",
        "AddToCart",
        {
          content_id: String(variationProduct?._id || product?._id),
          content_name: product?.product_name,
          content_type: "product",
          currency: "BDT",
          value: toNumber(price) * quantity,
          quantity,
        },
        { event_id: eventId },
      );
    },
    [],
  );

  // AddToWishlist
  const trackAddToWishlist = useCallback(
    (product, variationProduct, eventId) => {
      ttq(
        "track",
        "AddToWishlist",
        {
          content_id: String(variationProduct?._id || product?._id),
          content_name: product?.product_name,
          content_type: "product",
          currency: "BDT",
          value: toNumber(
            variationProduct?.variation_discount_price ||
              variationProduct?.variation_price ||
              product?.product_discount_price ||
              product?.product_price,
          ),
        },
        { event_id: eventId },
      );
    },
    [],
  );

  // InitiateCheckout
  const trackInitiateCheckout = useCallback((data, eventId) => {
    ttq(
      "track",
      "InitiateCheckout",
      {
        currency: "BDT",
        value: toNumber(data?.value),
        quantity: data?.num_items || 1,
      },
      { event_id: eventId },
    );
  }, []);

  // Purchase
  const trackPurchase = useCallback((orderData, eventId) => {
    ttq(
      "track",
      "CompletePayment",
      {
        currency: "BDT",
        value: toNumber(orderData?.grand_total_amount),
        quantity: orderData?.order_products?.length || 1,
        order_id: orderData?.purchase_event_id,
      },
      { event_id: eventId },
    );
  }, []);

  // Search
  const trackSearch = useCallback((searchTerm, eventId) => {
    ttq(
      "track",
      "Search",
      {
        query: searchTerm,
      },
      { event_id: eventId },
    );
  }, []);

  // Login
  const trackLogin = useCallback((eventId) => {
    ttq("track", "Login", {}, { event_id: eventId });
  }, []);

  // CompleteRegistration
  const trackCompleteRegistration = useCallback((eventId) => {
    ttq("track", "CompleteRegistration", {}, { event_id: eventId });
  }, []);

  return {
    trackViewContent,
    trackAddToCart,
    trackAddToWishlist,
    trackInitiateCheckout,
    trackPurchase,
    trackSearch,
    trackLogin,
    trackCompleteRegistration,
  };
};

export default useTikTokPixel;
