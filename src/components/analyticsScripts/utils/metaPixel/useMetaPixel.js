"use client";
// src/components/analyticsScripts/utils/metaPixel/useMetaPixel.js
// The tracking hook this file used to export is dead — every live event
// (ViewContent, AddToCart, Purchase, ...) goes through useAnalytics.js,
// which handles Meta + TikTok + GTM together. Only generateEventId is
// still used, by useAnalytics.js and MetaPixelScript.jsx (PageView).

// Unique event_id generate করো — browser + server deduplication এর জন্য
export const generateEventId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
