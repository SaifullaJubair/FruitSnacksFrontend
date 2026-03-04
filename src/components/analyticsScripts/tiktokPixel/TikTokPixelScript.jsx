"use client";

// src/components/analyticsScripts/tiktokPixel/TikTokPixelScript.jsx
// layout.jsx এ MetaPixelScript এর মতোই add করবে

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUserInfoQuery } from "@/redux/feature/auth/authApi";

const PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

// ttq safely call করো
export const ttq = (...args) => {
  if (typeof window !== "undefined" && window.ttq) {
    window.ttq(...args);
  }
};

// ✅ Advanced Matching — logged-in user এর data দিয়ে init
const AdvancedMatchingInit = () => {
  const { data: userInfo } = useUserInfoQuery();

  useEffect(() => {
    if (!userInfo?.data?.user_phone) return;
    if (typeof window === "undefined" || !window.ttq) return;

    const rawPhone = userInfo.data.user_phone;
    const phone = rawPhone.startsWith("+88")
      ? rawPhone.slice(3)
      : rawPhone.startsWith("88")
        ? rawPhone.slice(2)
        : rawPhone;

    window.ttq.identify({
      phone_number: phone,
      external_id: String(userInfo.data._id),
    });
  }, [userInfo?.data?.user_phone]);

  return null;
};

// ✅ PageView — route change হলে fire
const TikTokPageView = () => {
  const pathname = usePathname();

  useEffect(() => {
    ttq("track", "ViewContent"); // TikTok এ PageView = ViewContent
  }, [pathname]);

  return null;
};

const TikTokPixelScript = () => {
  if (!PIXEL_ID) return null;

  return (
    <>
      {/* TikTok Pixel init script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;
              var ttq=w[t]=w[t]||[];
              ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
              ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
              for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
              ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
              ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;
              ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
              n=document.createElement("script");n.type="text/javascript";n.async=!0;n.src=r+"?sdkid="+e+"&lib="+t;
              e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
              ttq.load('${PIXEL_ID}');
            }(window, document, 'ttq');
          `,
        }}
      />
      <TikTokPageView />
      <AdvancedMatchingInit />
    </>
  );
};

export default TikTokPixelScript;
