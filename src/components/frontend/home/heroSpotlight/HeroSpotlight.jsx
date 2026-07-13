import Image from "next/image";
import Link from "next/link";

import { getTrendingProductsServer } from "@/components/lib/getTrendingProductsServer";
import { getServerSettingData } from "@/components/lib/getServerSettingData";
import { productPrice, lineThroughPrice } from "@/utils/helper";
import Contain from "@/components/common/Contain";
import Reveal from "../boutique/reveal";
import { GlowBlob } from "../boutique/bits";
import HeroSpotlightActions from "./HeroSpotlightActions";

/**
 * Hero Spotlight — one star product, big and cinematic. Boutique preset section.
 *
 * Server Component. It used to fetch its product client-side (TanStack Query),
 * which meant the browser could not discover the LCP image URL until the JS
 * bundle had loaded, hydrated and completed a round-trip to the API — PageSpeed
 * measured 5,770ms of pure "resource load delay" on this one image. Fetching on
 * the server puts the <Image> (and so its preload) in the initial HTML.
 *
 * Source: the FIRST trending product (admin controls it via the existing
 * trending flag — no separate picker). Auto-hides if there are none.
 */
export default async function HeroSpotlight() {
  const [data, settingsData] = await Promise.all([
    getTrendingProductsServer(),
    getServerSettingData().catch(() => null),
  ]);

  const products = data?.data?.data || [];
  const product = products[0];
  if (!product) return null; // nothing to spotlight

  const currency = settingsData?.data?.[0]?.currency_symbol || "৳";
  const price = productPrice(product);
  const orig = lineThroughPrice(product);
  const href = `/products/${product.product_slug}`;

  return (
    <section className="py-6 md:py-12">
      <Contain>
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center rounded-3xl overflow-hidden bg-gradient-to-br from-[#FFF4EC] to-[#FFF9F2] p-6 sm:p-10 lg:p-16">
          {/* Ambient depth (decorative) */}
          <GlowBlob tone="warm" className="w-72 h-72 -top-16 -left-10" />
          <GlowBlob tone="green" className="w-64 h-64 -bottom-20 right-0" />

          {/* Copy */}
          <div className="relative z-10 order-2 lg:order-1 flex flex-col gap-5">
            <Reveal as="span" className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-primary-500">
              ★ আজকের বিশেষ পণ্য
            </Reveal>
            {product.badge_text && (
              <Reveal as="span" delay={0.04} className="self-start rounded-full bg-primary-500/10 text-primary-600 px-4 py-1.5 text-sm font-semibold">
                {product.badge_text}
              </Reveal>
            )}
            <Reveal as="h2" delay={0.05} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-gray-900">
              {product.product_name}
            </Reveal>
            {product.short_description && (
              <Reveal as="p" delay={0.1} className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-xl">
                {product.short_description}
              </Reveal>
            )}
            <Reveal delay={0.15} className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-primary-600 tabular-nums">
                {currency}
                {price}
              </span>
              {orig && orig > price && (
                <span className="text-lg text-gray-400 line-through tabular-nums">
                  {currency}
                  {orig}
                </span>
              )}
            </Reveal>

            {/* Interactive bits (cart / wishlist / quick-view / buy-now) */}
            <HeroSpotlightActions product={product} />

            <Reveal delay={0.25}>
              <Link
                href={href}
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full font-semibold border border-gray-300 text-gray-700 hover:border-primary-400 hover:text-primary-600 transition-colors"
              >
                বিস্তারিত দেখুন
              </Link>
            </Reveal>
          </div>

          {/* Image — deliberately NOT wrapped in <Reveal>.
              This is the LCP element. Reveal starts at opacity:0 and only fades
              in once framer-motion has hydrated, which held the paint for 2,650ms
              of "element render delay" — the image had already downloaded in
              340ms and then sat there, invisible, waiting for JavaScript. Getting
              the URL into the HTML is pointless if a client animation then hides
              the pixels. It paints as soon as it arrives now. */}
          <div className="relative z-10 order-1 lg:order-2">
            <div className="block relative aspect-square w-full max-w-lg mx-auto">
              <Link href={href} className="block relative w-full h-full">
                <Image
                  src={product.main_image || "/assets/images/placeholder.jpg"}
                  alt={product.product_name}
                  fill
                  priority
                  fetchPriority="high"
                  quality={65}
                  className="object-cover rounded-2xl shadow-xl"
                  // The image sits in a max-w-lg (512px) box, so 90vw over-asked:
                  // a 360px phone was served a 750px file for a 343px slot.
                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 60vw, 512px"
                />
              </Link>
            </div>
          </div>
        </div>
      </Contain>
    </section>
  );
}
