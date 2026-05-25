"use client";
// "দেখুন কিভাবে তৈরি হয়" — themed video section. Shows the video on the right
// and the process/feature steps ("how it's made") on the left. Colors come
// entirely from theme CSS variables.
//   - no video           → whole section hidden (steps alone aren't shown,
//                           since they only make sense next to the video)
//   - video, no steps     → video shown full-width
//   - video + steps       → steps (left) + video (right) side by side
import { useRef, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { FaHandHoldingHeart, FaSun, FaLeaf, FaBoxOpen } from "react-icons/fa6";
import DynamicIcon from "@/lib/icons/DynamicIcon";

// Meaningful default icons for the 4 process steps (when admin hasn't uploaded
// custom icon_url). Cycles if there are more than 4 steps.
const STEP_ICONS = [FaHandHoldingHeart, FaSun, FaLeaf, FaBoxOpen];

export default function VideoSection({ product, theme }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const hasVideo = !!product?.main_video;
  const steps = product?.process_steps || [];
  const hasSteps = steps.length > 0;
  // Process steps describe "how it's made" — they only make sense alongside the
  // video. No video → hide the whole section (heading + steps), even if steps
  // exist on the product.
  if (!hasVideo) return null;

  const handlePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.play();
    setPlaying(true);
  };

  return (
    <section
      className="relative overflow-hidden py-8 md:py-12"
      style={{ background: "var(--page-bg)" }}
    >

      <div className="max-w-6xl mx-auto px-4 relative">
        {/* Heading */}
        {hasVideo && (
          <div className="mb-6 flex items-center gap-2">
            <span
              className="w-1.5 h-7 rounded-full"
              style={{ background: "var(--brand-primary)" }}
            />
            <h2
              className="text-xl md:text-2xl font-bold leading-snug"
              style={{
                color: "var(--heading-color)",
                fontWeight: "var(--brand-heading-weight, 700)",
              }}
            >
              {product?.video_title || (
                <>
                  <span style={{ color: "var(--brand-primary)" }}>
                    {product?.product_name || "পণ্য"}
                  </span>{" "}
                  – ভিডিও
                </>
              )}
            </h2>
          </div>
        )}

        {/* Process steps (left, 2-col) + video (right, large) side by side */}
        <div
          className={`grid gap-5 md:gap-6 items-stretch ${
            hasVideo && hasSteps ? "lg:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {/* Process steps — 2-col grid, left */}
          {hasSteps && (
            <div className="grid grid-cols-2 gap-3 md:gap-4 content-center order-2 lg:order-1">
              {steps.map((step, i) => {
                const StepIcon = STEP_ICONS[i % STEP_ICONS.length];
                return (
                  <div
                    key={i}
                    className="relative flex flex-col items-center text-center justify-center gap-2.5 rounded-2xl p-5 bg-white border transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                    style={{ borderColor: "var(--brand-primary-light)" }}
                  >
                    {/* step number badge */}
                    <span
                      className="absolute top-2 left-2 flex items-center justify-center rounded-full text-[10px] font-bold"
                      style={{
                        width: 18,
                        height: 18,
                        background: "var(--brand-primary)",
                        color: "var(--button-text, #fff)",
                      }}
                    >
                      {i + 1}
                    </span>
                    {/* icon */}
                    <span
                      className="flex items-center justify-center rounded-full"
                      style={{
                        width: 54,
                        height: 54,
                        background: "var(--brand-primary-light)",
                        color: "var(--brand-primary-dark)",
                      }}
                    >
                      {step.icon_url ? (
                        <img
                          src={step.icon_url}
                          alt=""
                          width={28}
                          height={28}
                          className="object-contain"
                        />
                      ) : step.icon_key ? (
                        <DynamicIcon name={step.icon_key} size={24} />
                      ) : (
                        <StepIcon size={24} />
                      )}
                    </span>
                    <span
                      className="text-xs md:text-sm font-semibold leading-tight"
                      style={{ color: "var(--body-color)" }}
                    >
                      {step.text}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Video card — right */}
          {hasVideo && (
            <div
              className="relative rounded-2xl overflow-hidden shadow-lg group order-1 lg:order-2 ring-1"
              style={{
                aspectRatio: "16 / 9",
                background: "var(--section-bg)",
                "--tw-ring-color": "var(--brand-primary-light)",
              }}
            >
              <video
                ref={videoRef}
                src={product.main_video}
                poster={product?.main_image}
                controls={playing}
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                playsInline
                preload="metadata"
                className="w-full h-full object-cover"
                onContextMenu={(e) => e.preventDefault()}
                onPause={() => setPlaying(false)}
                onPlay={() => setPlaying(true)}
              />
              {!playing && (
                <button
                  type="button"
                  onClick={handlePlay}
                  aria-label="ভিডিও চালান"
                  className="absolute inset-0 flex items-center justify-center transition-opacity"
                  style={{ background: "rgba(0,0,0,0.18)" }}
                >
                  <span
                    className="flex items-center justify-center rounded-full shadow-xl transition-transform group-hover:scale-110"
                    style={{
                      width: 72,
                      height: 72,
                      background: "var(--brand-primary)",
                      color: "var(--button-text, #fff)",
                    }}
                  >
                    <FaPlay size={24} className="ml-1" />
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
