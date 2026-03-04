"use client";

// src/components/analyticsScripts/microsoftClarity/Microsoftclarity.jsx
// layout.jsx এ একবার add করলেই সব page এ কাজ করবে

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

const MicrosoftClarity = () => {
  if (!CLARITY_ID) return null;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${CLARITY_ID}");
        `,
      }}
    />
  );
};

export default MicrosoftClarity;
