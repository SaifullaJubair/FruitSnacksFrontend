"use client";
// scr/components/analyticsScripts/utils/useAnalytics.js
import { useCallback } from "react";
import { sendServerEvent } from "./metaPixel/metaServerEvent";
import { sendTikTokServerEvent } from "./tiktokPixel/TiktokServerEvent";
import useGetSettingData from "@/components/lib/getSettingData";
import { generateEventId } from "./metaPixel/useMetaPixel";

// ── helpers ────────────────────────────────────────────
const fbq = (...args) => {
  if (typeof window !== "undefined" && window.fbq) window.fbq(...args);
};

const ttq = (...args) => {
  if (typeof window !== "undefined" && window.ttq) window.ttq.track(...args);
};

// ── GTM dataLayer push ─────────────────────────────────
const pushDataLayer = (eventData) => {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(eventData);
  }
};

const toStringIds = (ids) => {
  if (!ids) return [];
  if (Array.isArray(ids)) return ids.map((id) => String(id));
  return [String(ids)];
};

const toNumber = (val) => parseFloat(val) || 0;

// ── Main Hook ──────────────────────────────────────────
const useAnalytics = () => {
  const { data: settingsData } = useGetSettingData();
  const settings = settingsData?.data?.[0];

  const metaEnabled = !!settings?.meta_pixel_enabled;
  const metaCapiEnabled = !!settings?.meta_capi_enabled;
  const tiktokEnabled = !!settings?.tiktok_pixel_enabled;
  const tiktokCapiEnabled = !!settings?.tiktok_capi_enabled;
  const gtmEnabled = !!settings?.gtm_enabled;

  // ── ViewContent ────────────────────────────────────
  const trackViewContent = useCallback(
    async (product, userData = {}) => {
      const eventId = generateEventId();
      const price = toNumber(
        product?.product_discount_price || product?.product_price,
      );

      if (metaEnabled) {
        fbq(
          "track",
          "ViewContent",
          {
            content_ids: toStringIds([product?._id]),
            content_name: product?.product_name,
            content_type: "product",
            currency: "BDT",
            value: price,
          },
          { eventID: eventId },
        );

        if (metaCapiEnabled) {
          await sendServerEvent({
            event_name: "ViewContent",
            event_id: eventId,
            user_data: userData,
            custom_data: {
              content_ids: toStringIds([product?._id]),
              content_name: product?.product_name,
              content_type: "product",
              currency: "BDT",
              value: price,
            },
          });
        }
      }

      if (tiktokEnabled) {
        ttq(
          "ViewContent",
          {
            content_id: String(product?._id),
            content_name: product?.product_name,
            currency: "BDT",
            value: price,
          },
          { event_id: eventId },
        );
        if (tiktokCapiEnabled) {
          await sendTikTokServerEvent({
            event_name: "ViewContent",
            event_id: eventId,
            user_data: userData,
            properties: {
              content_id: String(product?._id),
              content_name: product?.product_name,
              content_type: "product",
              currency: "BDT",
              value: price,
            },
          });
        }
      }

      if (gtmEnabled) {
        pushDataLayer({
          event: "view_item",
          ecommerce: {
            currency: "BDT",
            value: price,
            items: [
              {
                item_id: String(product?._id),
                item_name: product?.product_name,
                price,
              },
            ],
          },
        });
      }
    },
    [
      metaEnabled,
      metaCapiEnabled,
      tiktokEnabled,
      tiktokCapiEnabled,
      gtmEnabled,
    ],
  );

  // ── AddToCart ──────────────────────────────────────
  const trackAddToCart = useCallback(
    async (product, variationProduct, quantity, userData = {}) => {
      const eventId = generateEventId();
      const price = toNumber(
        variationProduct
          ? variationProduct?.variation_discount_price ||
              variationProduct?.variation_price
          : product?.product_discount_price || product?.product_price,
      );
      const itemId = String(variationProduct?._id || product?._id);
      const totalValue = price * quantity;

      if (metaEnabled) {
        fbq(
          "track",
          "AddToCart",
          {
            content_ids: [itemId],
            content_name: product?.product_name,
            content_type: "product",
            currency: "BDT",
            value: totalValue,
            num_items: quantity,
          },
          { eventID: eventId },
        );

        if (metaCapiEnabled) {
          await sendServerEvent({
            event_name: "AddToCart",
            event_id: eventId,
            user_data: userData,
            custom_data: {
              content_ids: [itemId],
              content_name: product?.product_name,
              content_type: "product",
              currency: "BDT",
              value: totalValue,
              num_items: quantity,
            },
          });
        }
      }

      if (tiktokEnabled) {
        ttq(
          "AddToCart",
          {
            content_id: itemId,
            content_name: product?.product_name,
            currency: "BDT",
            value: totalValue,
            quantity,
          },
          { event_id: eventId },
        );
        if (tiktokCapiEnabled) {
          await sendTikTokServerEvent({
            event_name: "AddToCart",
            event_id: eventId,
            user_data: userData,
            properties: {
              content_id: itemId,
              content_name: product?.product_name,
              content_type: "product",
              currency: "BDT",
              value: totalValue,
              quantity,
            },
          });
        }
      }

      if (gtmEnabled) {
        pushDataLayer({
          event: "add_to_cart",
          ecommerce: {
            currency: "BDT",
            value: totalValue,
            items: [
              {
                item_id: itemId,
                item_name: product?.product_name,
                price,
                quantity,
              },
            ],
          },
        });
      }
    },
    [
      metaEnabled,
      metaCapiEnabled,
      tiktokEnabled,
      tiktokCapiEnabled,
      gtmEnabled,
    ],
  );

  // ── Purchase ───────────────────────────────────────
  const trackPurchase = useCallback(
    async (orderData, userData = {}) => {
      const eventId = generateEventId();
      const value = toNumber(orderData?.grand_total_amount);
      const contentIds = toStringIds(
        orderData?.order_products?.map((p) => p?.product_id),
      );

      if (metaEnabled) {
        fbq(
          "track",
          "Purchase",
          {
            content_ids: contentIds,
            content_type: "product",
            currency: "BDT",
            value,
            num_items: orderData?.order_products?.length || 0,
          },
          { eventID: eventId },
        );

        if (metaCapiEnabled) {
          await sendServerEvent({
            event_name: "Purchase",
            event_id: eventId,
            user_data: userData,
            custom_data: {
              content_ids: contentIds,
              content_type: "product",
              currency: "BDT",
              value,
              num_items: orderData?.order_products?.length || 0,
            },
          });
        }
      }

      if (tiktokEnabled) {
        ttq(
          "CompletePayment",
          {
            currency: "BDT",
            value,
            quantity: orderData?.order_products?.length || 1,
          },
          { event_id: eventId },
        );
        if (tiktokCapiEnabled) {
          await sendTikTokServerEvent({
            event_name: "CompletePayment",
            event_id: eventId,
            user_data: userData,
            properties: {
              currency: "BDT",
              value,
              quantity: orderData?.order_products?.length || 1,
            },
          });
        }
      }

      if (gtmEnabled) {
        pushDataLayer({
          event: "purchase",
          ecommerce: {
            transaction_id: String(orderData?._id),
            currency: "BDT",
            value,
            items: orderData?.order_products?.map((p) => ({
              item_id: String(p?.product_id),
              item_name: p?.product_name,
              price: toNumber(p?.product_price),
              quantity: p?.quantity || 1,
            })),
          },
        });
      }
    },
    [
      metaEnabled,
      metaCapiEnabled,
      tiktokEnabled,
      tiktokCapiEnabled,
      gtmEnabled,
    ],
  );

  // ── InitiateCheckout ───────────────────────────────
  const trackInitiateCheckout = useCallback(
    async (orderData, userData = {}) => {
      const eventId = generateEventId();
      const value = toNumber(orderData?.value);

      if (metaEnabled) {
        fbq(
          "track",
          "InitiateCheckout",
          {
            content_ids: toStringIds(orderData?.content_ids),
            content_type: "product",
            currency: "BDT",
            value,
            num_items: orderData?.num_items || 1,
          },
          { eventID: eventId },
        );

        if (metaCapiEnabled) {
          await sendServerEvent({
            event_name: "InitiateCheckout",
            event_id: eventId,
            user_data: userData,
            custom_data: {
              content_ids: toStringIds(orderData?.content_ids),
              currency: "BDT",
              value,
            },
          });
        }
      }

      if (tiktokEnabled) {
        ttq(
          "InitiateCheckout",
          { currency: "BDT", value, quantity: orderData?.num_items || 1 },
          { event_id: eventId },
        );
        if (tiktokCapiEnabled) {
          await sendTikTokServerEvent({
            event_name: "InitiateCheckout",
            event_id: eventId,
            user_data: userData,
            properties: {
              currency: "BDT",
              value,
              quantity: orderData?.num_items || 1,
            },
          });
        }
      }

      if (gtmEnabled) {
        pushDataLayer({
          event: "begin_checkout",
          ecommerce: { currency: "BDT", value },
        });
      }
    },
    [
      metaEnabled,
      metaCapiEnabled,
      tiktokEnabled,
      tiktokCapiEnabled,
      gtmEnabled,
    ],
  );

  // ── Search ─────────────────────────────────────────
  const trackSearch = useCallback(
    (searchString) => {
      const eventId = generateEventId();

      if (metaEnabled)
        fbq(
          "track",
          "Search",
          { search_string: searchString, currency: "BDT" },
          { eventID: eventId },
        );
      if (tiktokEnabled)
        ttq("Search", { query: searchString }, { event_id: eventId });
      if (gtmEnabled)
        pushDataLayer({ event: "search", search_term: searchString });
    },
    [metaEnabled, tiktokEnabled, gtmEnabled],
  );

  // ── Login ──────────────────────────────────────────
  const trackLogin = useCallback(
    async (userData = {}) => {
      const eventId = generateEventId();

      if (metaEnabled) {
        fbq("track", "Login", {}, { eventID: eventId });
        if (metaCapiEnabled) {
          await sendServerEvent({
            event_name: "Login",
            event_id: eventId,
            user_data: userData,
          });
        }
      }

      if (tiktokEnabled) {
        ttq("Login", {}, { event_id: eventId });
        if (tiktokCapiEnabled) {
          await sendTikTokServerEvent({
            event_name: "Login",
            event_id: eventId,
            user_data: userData,
          });
        }
      }

      if (gtmEnabled) pushDataLayer({ event: "login", method: "phone" });
    },
    [
      metaEnabled,
      metaCapiEnabled,
      tiktokEnabled,
      tiktokCapiEnabled,
      gtmEnabled,
    ],
  );

  // ── CompleteRegistration ───────────────────────────
  const trackCompleteRegistration = useCallback(
    async (userData = {}) => {
      const eventId = generateEventId();

      if (metaEnabled) {
        fbq("track", "CompleteRegistration", {}, { eventID: eventId });
        if (metaCapiEnabled) {
          await sendServerEvent({
            event_name: "CompleteRegistration",
            event_id: eventId,
            user_data: userData,
          });
        }
      }

      if (tiktokEnabled) {
        ttq("CompleteRegistration", {}, { event_id: eventId });
        if (tiktokCapiEnabled) {
          await sendTikTokServerEvent({
            event_name: "CompleteRegistration",
            event_id: eventId,
            user_data: userData,
          });
        }
      }

      if (gtmEnabled) pushDataLayer({ event: "sign_up", method: "phone" });
    },
    [
      metaEnabled,
      metaCapiEnabled,
      tiktokEnabled,
      tiktokCapiEnabled,
      gtmEnabled,
    ],
  );

  // ── AddToWishlist ──────────────────────────────────
  const trackAddToWishlist = useCallback(
    (product, variationProduct) => {
      const eventId = generateEventId();
      const price = toNumber(
        variationProduct
          ? variationProduct?.variation_discount_price ||
              variationProduct?.variation_price
          : product?.product_discount_price || product?.product_price,
      );
      const itemId = String(variationProduct?._id || product?._id);

      if (metaEnabled) {
        fbq(
          "track",
          "AddToWishlist",
          {
            content_ids: [itemId],
            content_name: product?.product_name,
            content_type: "product",
            currency: "BDT",
            value: price,
          },
          { eventID: eventId },
        );
      }

      if (tiktokEnabled) {
        ttq(
          "AddToWishlist",
          {
            content_id: itemId,
            content_name: product?.product_name,
            currency: "BDT",
            value: price,
          },
          { event_id: eventId },
        );
      }

      if (gtmEnabled) {
        pushDataLayer({
          event: "add_to_wishlist",
          ecommerce: {
            currency: "BDT",
            value: price,
            items: [
              { item_id: itemId, item_name: product?.product_name, price },
            ],
          },
        });
      }
    },
    [metaEnabled, tiktokEnabled, gtmEnabled],
  );

  return {
    trackViewContent,
    trackAddToCart,
    trackPurchase,
    trackInitiateCheckout,
    trackSearch,
    trackLogin,
    trackCompleteRegistration,
    trackAddToWishlist,
  };
};

export default useAnalytics;
