"use client";

// src/components/analyticsScripts/googleAnalytics/GoogleTagManager.jsx
// GTM script — layout.jsx এ একবার add করলেই সব page এ কাজ করবে
// GTM এর ভেতরে GA4 already connected আছে
// ✅ gtmId prop — layout থেকে settings.gtm_id আসবে
import Script from "next/script";

// This was a raw <script> tag, so Next had no say in when it ran — it executed
// as the parser reached it. Together with GA4 it cost ~151ms of main-thread work
// before the page was interactive. next/script + lazyOnload defers it to idle;
// the dataLayer queue is created first so any event pushed before GTM loads is
// still delivered once it does.
const GoogleTagManager = ({ gtmId }) => {
  if (!gtmId) return null;
  return (
    <>
      <Script id="gtm-datalayer-init" strategy="beforeInteractive">
        {`window.dataLayer = window.dataLayer || [];`}
      </Script>
      <Script id="google-tag-manager" strategy="lazyOnload">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `}
      </Script>
    </>
  );
};

export const GoogleTagManagerNoScript = ({ gtmId }) => {
  if (!gtmId) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
};

export default GoogleTagManager;
