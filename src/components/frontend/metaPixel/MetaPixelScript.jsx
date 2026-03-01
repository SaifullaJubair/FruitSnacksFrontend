"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useUserInfoQuery } from "@/redux/feature/auth/authApi";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

// Route change এ PageView track করো
const PageViewTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname, searchParams]);

  return null;
};

// ✅ Advanced Matching — logged-in user এর data fbq('init') এ pass করো
const AdvancedMatchingInit = () => {
  const { data: userInfo } = useUserInfoQuery();

  useEffect(() => {
    if (!userInfo?.data?.user_phone) return;
    if (typeof window === "undefined" || !window.fbq) return;

    // Phone normalize করো — +880 বা 880 prefix বাদ দাও
    const rawPhone = userInfo.data.user_phone;
    const phone = rawPhone.startsWith("+88")
      ? rawPhone.slice(3)
      : rawPhone.startsWith("88")
        ? rawPhone.slice(2)
        : rawPhone;

    // ✅ fbq('init') আবার call করো advanced matching data দিয়ে
    window.fbq("init", String(PIXEL_ID), {
      ph: phone, // Facebook internally hash করবে
      fn: userInfo.data.user_name || undefined,
      external_id: String(userInfo.data._id),
    });
  }, [userInfo?.data?.user_phone]);

  return null;
};

const MetaPixelScript = () => {
  if (!PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <Suspense fallback={null}>
        <PageViewTracker />
        <AdvancedMatchingInit />
      </Suspense>
    </>
  );
};

export default MetaPixelScript;
