"use client";
// Contained product image carousel for the themed hero.
// Sources, in order: selected variation image → product main image →
// other_images[] → main_video / variation_video (shown as a video thumb).
// Clicking a thumb swaps the main view. When the user picks a different
// variation in the order section, variationProduct changes and the active
// image follows it.
import { useEffect, useState } from "react";
import { FaPlay } from "react-icons/fa6";
import { isVideo } from "@/utils/helper";

export default function HeroGallery({ product, variationProduct }) {
  const variationImg = variationProduct?.variation_image;
  const variationVid = variationProduct?.variation_video;
  const baseImg = variationImg || product?.main_image;

  // Build ordered, de-duplicated media list
  const media = [];
  if (baseImg) media.push(baseImg);
  (product?.other_images || []).forEach((o) => {
    if (o?.other_image && !media.includes(o.other_image)) media.push(o.other_image);
  });
  const video = variationVid || product?.main_video;
  if (video && !media.includes(video)) media.push(video);

  const [active, setActive] = useState(baseImg);

  // follow variation change
  useEffect(() => {
    if (baseImg) setActive(baseImg);
  }, [baseImg]);

  if (!active && media.length === 0) return null;
  const current = active || media[0];

  return (
    <div className="w-full max-w-[520px] mx-auto relative z-10">
      {/* Main view */}
      <div
        className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-sm"
        style={{ background: "var(--section-bg)" }}
      >
        {isVideo(current) ? (
          <video src={current} controls muted className="w-full h-full object-cover" />
        ) : (
          <img
            src={current}
            alt={product?.product_name || "product"}
            className="w-full h-full object-cover transition-opacity duration-200"
          />
        )}

        {/* Corner badge is admin-driven via product.hero_corner_badge, rendered
            once by SingleProduct on the hero image wrapper — no hardcoded label
            here. */}
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="flex gap-2 mt-3 justify-center flex-wrap">
          {media.map((src, i) => {
            const isVid = isVideo(src);
            const isActive = current === src;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setActive(src)}
                className="relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all"
                style={{ borderColor: isActive ? "var(--brand-primary)" : "transparent" }}
              >
                {isVid ? (
                  <>
                    <video src={src} muted className="w-full h-full object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <FaPlay size={12} className="text-white" />
                    </span>
                  </>
                ) : (
                  <img src={src} alt="" className="w-full h-full object-cover" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
