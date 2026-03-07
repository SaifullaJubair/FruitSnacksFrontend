import { getSeoConfig } from "@/components/lib/getSeoConfig";
import Providers from "@/components/providers/Providers";
import QueryProviders from "@/components/providers/QueryProviders";
import { bodyFont } from "@/utils/font";
import "react-loading-skeleton/dist/skeleton.css";
import "react-photo-view/dist/react-photo-view.css";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-tooltip/dist/react-tooltip.css";
import "./globals.css";
import AnalyticsAdvancedMatching from "@/components/analyticsScripts/utils/AnalyticsAdvancedMatching";
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
    verification: {
      google: process.env.GOOGLE_VERIFICATION,
    },

    // ── 4. Icons ──────────────────────────────────────────
    icons: {
      icon: seo.favicon || "/favicon.ico",
      shortcut: seo.favicon || "/favicon.ico",
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
    <html lang="bn">
      <head>{seo.gtmId && <GoogleTagManager gtmId={seo.gtmId} />}</head>
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
