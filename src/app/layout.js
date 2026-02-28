// src/app/layout.js
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
import MetaPixelScript from "@/components/frontend/metaPixel/MetaPixelScript";

export async function generateMetadata() {
  const seo = await getSeoConfig();

  return {
    metadataBase: new URL(seo.siteUrl),
    title: {
      default: seo.seoTitle,
      template: `%s | ${seo.siteName}`,
    },
    description: seo.seoDescription,
    keywords: seo.seoKeywords,
    authors: [{ name: seo.siteName, url: seo.siteUrl }],
    creator: seo.siteName,
    publisher: seo.siteName,
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
    openGraph: {
      type: "website",
      locale: "bn_BD",
      url: seo.siteUrl,
      siteName: seo.siteName,
      title: seo.seoTitle,
      description: seo.seoDescription,
      images: [
        {
          url: seo.logo,
          width: 1200,
          height: 630,
          alt: seo.siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.seoTitle,
      description: seo.seoDescription,
      images: [seo.logo],
    },
    alternates: {
      canonical: seo.siteUrl,
    },
  };
}

export default async function RootLayout({ children }) {
  const seo = await getSeoConfig();

  return (
    <html lang="bn">
      <head>
        <link rel="icon" href={seo.favicon} type="image/x-icon" />
      </head>
      <body className={bodyFont.className}>
        <Providers>
          <QueryProviders>
            <MetaPixelScript />
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
