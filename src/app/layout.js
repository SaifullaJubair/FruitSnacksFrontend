import { getSeoConfig } from "@/components/lib/getSeoConfig";
import Providers from "@/components/providers/Providers";
import QueryProviders from "@/components/providers/QueryProviders";
import { bodyFont, sansFont } from "@/utils/font";
import "react-loading-skeleton/dist/skeleton.css";
import "react-photo-view/dist/react-photo-view.css";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-tooltip/dist/react-tooltip.css";
import "./globals.css";
import AnalyticsAdvancedMatching from "@/components/analyticsScripts/utils/AnalyticsAdvancedMatching";
import FbclidCapture from "@/components/analyticsScripts/utils/FbclidCapture";
import TikTokPixelScript from "@/components/analyticsScripts/tiktokPixel/TikTokPixelScript";
import MetaPixelScript from "@/components/analyticsScripts/metaPixel/MetaPixelScript";
import GoogleTagManager, {
  GoogleTagManagerNoScript,
} from "@/components/analyticsScripts/googleAnalytics/GoogleTagManager";
import MicrosoftClarity from "@/components/analyticsScripts/microsoftClarity/MicrosoftClarity";

export async function generateMetadata() {
  const seo = await getSeoConfig();
  return {
    // ── 1. Basic ──────────────────────────────────────────
    metadataBase: new URL(seo.siteUrl),
    title: {
      default: seo.seoTitle,
      template: `%s | ${seo.siteName}`,
    },
    // description — buildPageMeta থেকে আসে, কিন্তু
    // যে page এ generateMetadata নেই সেখানে এটা fallback
    description: seo.seoDescription,
    keywords: seo.seoKeywords,

    // ── 2. Robots ─────────────────────────────────────────
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // ── 3. Verification ───────────────────────────────────
    // S4+S5 Phase 1A — DB-driven via Admin Site Settings → Analytics
    // tab, .env fallback for back-compat.
    verification: {
      google: seo.googleVerification || undefined,
    },

    // ── 4. Icons ──────────────────────────────────────────
    // NOTE: external S3 URLs in `icons` don't render in browser tabs —
    // Next.js doesn't proxy them. The actual <link rel="icon"> is injected
    // manually in RootLayout <head> below using the DB favicon URL.
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },

    // ── 5. Format Detection ───────────────────────────────
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },

    // ── 6. OG & Twitter — fallback ────────────────────────
    openGraph: {
      type: "website",
      locale: "bn_BD",
      siteName: seo.siteName,
      url: seo.siteUrl,
      title: seo.seoTitle,
      description: seo.seoDescription,
      images: [{ url: seo.logo, width: 1200, height: 630, alt: seo.siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.seoTitle,
      description: seo.seoDescription,
      images: [seo.logo],
    },
  };
}

export default async function RootLayout({ children }) {
  const seo = await getSeoConfig();

  // Organization JSON-LD — Google কে business সম্পর্কে জানায়
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: seo.siteName,
    url: seo.siteUrl,
    logo: seo.logo,
    sameAs: [
      seo.facebook,
      seo.instagram,
      seo.youtube,
      seo.whatsapp,
      seo.twitter,
    ].filter(Boolean),
  };

  return (
    <html lang="bn" className={sansFont.variable}>
      <head>
        {seo.gtmId && <GoogleTagManager gtmId={seo.gtmId} />}
        {seo.favicon && seo.favicon !== "/favicon.ico" && (
          <link rel="icon" href={seo.favicon} />
        )}
      </head>
      <body className={bodyFont.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />

        {seo.gtmId && <GoogleTagManagerNoScript gtmId={seo.gtmId} />}

        {/* ✅ Pixel scripts — Providers এর বাইরে, Redux নেই এখানে */}
        {seo.metaPixelId && <MetaPixelScript pixelId={seo.metaPixelId} />}
        {seo.tiktokPixelId && <TikTokPixelScript pixelId={seo.tiktokPixelId} />}
        {seo.clarityId && <MicrosoftClarity clarityId={seo.clarityId} />}

        {/* Phase 1B B7 — convert ?fbclid= URL param into _fbc cookie BEFORE
            first event fires, so ad-click visitors are Meta-attributable
            from their very first ViewContent. */}
        <FbclidCapture />

        <Providers>
          <QueryProviders>
            {/* ✅ AdvancedMatching — Providers এর ভেতরে, Redux কাজ করবে */}
            <AnalyticsAdvancedMatching
              metaPixelId={seo.metaPixelId}
              tiktokPixelId={seo.tiktokPixelId}
            />
            <main>
              {children}
              <ToastContainer
                position="bottom-right"
                autoClose={1500}
                transition={Slide}
                closeOnClick
              />
            </main>
          </QueryProviders>
        </Providers>
      </body>
    </html>
  );
}
