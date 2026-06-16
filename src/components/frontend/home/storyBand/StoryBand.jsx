"use client";

import Image from "next/image";
import Link from "next/link";
import Contain from "@/components/common/Contain";
import Reveal from "../boutique/reveal";

/**
 * Story Band — the calm "why us / brand story" beat between product rows.
 * Boutique preset section. Reuses the existing `brand_story_*` settings (same
 * fields the marketplace BrandStory reads) so the admin fills it in ONE place;
 * this is just the premium, animated, full-bleed presentation.
 *
 * Auto-hides when there's no story content (edge-audit H2). Trust points are a
 * separate home section (`trust_strip`) — not duplicated here.
 */
export default function StoryBand({ settings }) {
  const title = settings?.brand_story_title || "";
  const text = settings?.brand_story_text || "";
  const imageUrl = settings?.brand_story_image_url || settings?.brand_story_image || "";
  const ctaLabel = settings?.brand_story_cta_label || "";
  const ctaUrl = settings?.brand_story_cta_url || "";

  if (!text && !imageUrl && !title) return null;

  return (
    <section className="py-6 md:py-14">
      <Contain>
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center rounded-3xl overflow-hidden bg-gradient-to-tr from-[#F4FBF5] to-[#FFF9F2] p-6 sm:p-10 lg:p-16">
          {/* Image */}
          {imageUrl && (
            <Reveal y={32} className="order-1">
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={imageUrl}
                  alt={title || "Our story"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 90vw, 46vw"
                />
              </div>
            </Reveal>
          )}

          {/* Copy */}
          <div className="order-2 flex flex-col gap-5">
            {title && (
              <Reveal as="h2" className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                {title}
              </Reveal>
            )}
            {text && (
              <Reveal as="p" delay={0.08} className="text-gray-600 text-base sm:text-lg leading-relaxed whitespace-pre-line">
                {text}
              </Reveal>
            )}
            {ctaLabel && ctaUrl && (
              <Reveal delay={0.16}>
                <Link
                  href={ctaUrl}
                  className="inline-block self-start bg-primary-500 hover:bg-primary-600 text-white px-7 py-3.5 rounded-full font-semibold transition-colors"
                >
                  {ctaLabel}
                </Link>
              </Reveal>
            )}
          </div>
        </div>
      </Contain>
    </section>
  );
}
