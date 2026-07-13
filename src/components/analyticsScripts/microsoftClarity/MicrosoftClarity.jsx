"use client";
// src/components/analyticsScripts/microsoftClarity/MicrosoftClarity.jsx
import Script from "next/script";
// layout.jsx এ একবার add করলেই সব page এ কাজ করবে
// ✅ clarityId prop — layout থেকে settings.clarity_id আসবে
const MicrosoftClarity = ({ clarityId }) => {
  if (!clarityId) return null;
  return (
    // lazyOnload, not afterInteractive: session-recording has no bearing on what
    // the customer sees, and afterInteractive put it on the main thread during
    // hydration — 218ms of script evaluation competing with the page becoming
    // usable. It now runs once the page is idle.
    <Script id="microsoft-clarity" strategy="lazyOnload">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${clarityId}");
      `}
    </Script>
  );
};

export default MicrosoftClarity;
