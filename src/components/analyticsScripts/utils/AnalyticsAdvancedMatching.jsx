"use client";
// src/components/analyticsScripts/utils/AnalyticsAdvancedMatching.jsx
// ✅ Providers এর ভেতরে — Redux কাজ করবে
import { useEffect } from "react";
import { useUserInfoQuery } from "@/redux/feature/auth/authApi";

const normalizePhone = (phone) => {
  if (!phone) return null;
  return phone.startsWith("+88")
    ? phone.slice(3)
    : phone.startsWith("88")
      ? phone.slice(2)
      : phone;
};

const AnalyticsAdvancedMatching = ({ metaPixelId, tiktokPixelId }) => {
  const { data: userInfo } = useUserInfoQuery();
  const phone = normalizePhone(userInfo?.data?.user_phone);
  const name = userInfo?.data?.user_name;
  const externalId = userInfo?.data?._id;

  // ✅ Meta Advanced Matching
  useEffect(() => {
    if (!phone || !metaPixelId || !window.fbq) return;
    window.fbq("init", String(metaPixelId), {
      ph: phone,
      fn: name || undefined,
      external_id: String(externalId),
    });
  }, [phone, metaPixelId]);

  // ✅ TikTok Advanced Matching
  useEffect(() => {
    if (!phone || !tiktokPixelId || !window.ttq) return;
    window.ttq.identify({
      phone_number: phone,
      external_id: String(externalId),
    });
  }, [phone, tiktokPixelId]);

  return null;
};

export default AnalyticsAdvancedMatching;
