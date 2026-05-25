"use client";
// Standalone theme preview — meant to be embedded in an <iframe> from the admin
// Theme form. Reads the palette + typography from query params, derives the
// full color set (mirrors the backend chroma logic), injects CSS vars, then
// renders a realistic themed PDP using DUMMY product data. No navbar/footer/
// cart — purely visual so admins see exactly how their theme looks.
//
// URL: /theme-preview?primary=%23E67E22&page_bg=%23FFF8F0&accent=%23F1C40F
//        &font=hind-siliguri&heading_weight=700&button_radius=8px
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ThemeStyleInjector from "@/components/frontend/themedProduct/theme/ThemeStyleInjector";
import ProductThemedSections from "@/components/frontend/themedProduct/theme/ProductThemedSections";
import ProductFloatingImages from "@/components/frontend/themedProduct/theme/ProductFloatingImages";

// ── color derivation (mirrors admin ColorAutoPreview + backend chroma) ──
const clamp = (n, min = 0, max = 255) => Math.min(max, Math.max(min, n));
const hexToRgb = (hex) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
};
const rgbToHex = ({ r, g, b }) =>
  "#" + [r, g, b].map((v) => clamp(Math.round(v)).toString(16).padStart(2, "0")).join("");
const lighten = (hex, amt) => {
  const c = hexToRgb(hex);
  if (!c) return hex;
  return rgbToHex({ r: c.r + (255 - c.r) * amt, g: c.g + (255 - c.g) * amt, b: c.b + (255 - c.b) * amt });
};
const darken = (hex, amt) => {
  const c = hexToRgb(hex);
  if (!c) return hex;
  return rgbToHex({ r: c.r * (1 - amt), g: c.g * (1 - amt), b: c.b * (1 - amt) });
};
const mix = (a, b, t) => {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  if (!ca || !cb) return a;
  return rgbToHex({ r: ca.r * (1 - t) + cb.r * t, g: ca.g * (1 - t) + cb.g * t, b: ca.b * (1 - t) + cb.b * t });
};

const buildTheme = (sp) => {
  const primary = sp.get("primary") || "#1B5E20";
  const page_bg = sp.get("page_bg") || "#F8F6F0";
  const accent = sp.get("accent") || "#E6B547";
  return {
    colors: {
      primary,
      page_bg,
      accent,
      primary_light: lighten(primary, 0.55),
      primary_dark: darken(primary, 0.35),
      heading_text: darken(primary, 0.55),
      body_text: darken(primary, 0.45),
      section_bg: mix(page_bg, primary, 0.08),
      button_text: "#FFFFFF",
    },
    typography: {
      heading_font: sp.get("heading_font") || sp.get("font") || "hind-siliguri",
      body_font: sp.get("body_font") || sp.get("font") || "hind-siliguri",
      heading_weight: sp.get("heading_weight") || "700",
    },
    button_style: { border_radius: sp.get("button_radius") || "8px" },
    floating_assets: [],
  };
};

// Realistic dummy product so every themed section renders with content.
const DUMMY_PRODUCT = {
  product_name: "শুকনো আম (Sample Mango)",
  product_slug: "sample",
  main_image:
    "https://images.unsplash.com/photo-1605027990121-cbae9e0642df?w=600&q=80",
  badge_text: "প্রিমিয়াম কোয়ালিটি",
  hero_corner_badge: "নতুন",
  short_description: "১০০% প্রাকৃতিক — চিনি ছাড়া, প্রিজারভেটিভ ছাড়া।",
  video_title: "দেখুন কিভাবে তৈরি হয়",
  process_steps: [
    { icon_key: "fa:FaHandHoldingHeart", text: "তাজা ফল বাছাই" },
    { icon_key: "fa:FaSun", text: "প্রাকৃতিকভাবে শুকানো" },
    { icon_key: "lu:Leaf", text: "পুষ্টিগুণ অক্ষুন্ন" },
    { icon_key: "fa:FaBoxOpen", text: "পরীক্ষিত ও প্যাকেটজাত" },
  ],
  benefits: [
    "রোগ প্রতিরোধ ক্ষমতা বাড়ায়",
    "হজমে সাহায্য করে",
    "ভিটামিনে ভরপুর",
    "তাৎক্ষণিক এনার্জি দেয়",
  ],
  use_cases: [
    { icon_key: "fa:FaBriefcase", text: "অফিস স্ন্যাকস" },
    { icon_key: "lu:GraduationCap", text: "স্কুল টিফিন" },
    { icon_key: "fa:FaDumbbell", text: "জিম-পরবর্তী" },
    { icon_key: "fa:FaPlane", text: "ভ্রমণসঙ্গী" },
  ],
  nutrition: {
    per_serving: "প্রতি ১০০g",
    rows: [
      { label: "ক্যালরি", value: "৩১০ kcal" },
      { label: "প্রোটিন", value: "৩.৫ g" },
      { label: "ফাইবার", value: "৭ g" },
      { label: "চিনি", value: "৬৫ g" },
    ],
    info_tiles: [
      { icon_key: "lu:Leaf", label: "উপাদান", value: "১০০% প্রাকৃতিক" },
      { icon_key: "lu:Calendar", label: "শেলফ লাইফ", value: "৬ মাস" },
    ],
  },
  faqs: [
    { question: "চিনি মেশানো আছে?", answer: "না, ১০০% প্রাকৃতিক।" },
    { question: "কতদিন সংরক্ষণ করা যায়?", answer: "৬ মাস পর্যন্ত।" },
  ],
  floating_images: [
    { asset_url: "https://images.unsplash.com/photo-1546173159-315724a31696?w=200&q=80", vertical: "12", side: "left", layer: "behind", size: "md" },
    { asset_url: "https://images.unsplash.com/photo-1546173159-315724a31696?w=200&q=80", vertical: "55", side: "right", layer: "behind", size: "lg" },
  ],
};

const DUMMY_TRUST = [
  { icon_key: "lu:Leaf", title: "১০০% প্রাকৃতিক", subtitle: "কৃত্রিম কিছু নয়" },
  { icon_key: "lu:ShieldCheck", title: "নিরাপদ", subtitle: "প্রিজারভেটিভ মুক্ত" },
  { icon_key: "fa:FaTruckFast", title: "দ্রুত ডেলিভারি", subtitle: "সারাদেশে" },
];

function PreviewBody() {
  const sp = useSearchParams();
  const theme = buildTheme(sp);

  return (
    <div
      data-themed-pdp
      className="relative overflow-hidden"
      style={{
        background: "var(--page-bg, #fff)",
        minHeight: "100vh",
        fontFamily: "var(--brand-font)",
      }}
    >
      <ThemeStyleInjector theme={theme} />
      <ProductFloatingImages images={DUMMY_PRODUCT.floating_images} />

      <div className="relative" style={{ zIndex: 1 }}>
      {/* Compact themed hero mock (SingleProduct is too heavy for preview) */}
      <section className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-6 items-center">
        <div className="space-y-3 order-2 md:order-1">
          <span
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: "var(--brand-primary-light)", color: "var(--brand-primary-dark)" }}
          >
            {DUMMY_PRODUCT.badge_text}
          </span>
          <h1 className="text-3xl font-black" style={{ color: "var(--heading-color)" }}>
            {DUMMY_PRODUCT.product_name}
          </h1>
          <p style={{ color: "var(--body-color)" }}>{DUMMY_PRODUCT.short_description}</p>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-black" style={{ color: "var(--brand-primary)" }}>
              ৳৩৮০
            </span>
            <span className="text-lg line-through text-gray-400">৳৪৫০</span>
          </div>
          <button
            className="px-6 py-3 font-bold text-white"
            style={{ background: "var(--brand-primary)", borderRadius: "var(--button-radius)" }}
          >
            অর্ডার করুন এখনই
          </button>
        </div>
        <div className="order-1 md:order-2 relative">
          <span
            className="absolute top-3 left-3 z-10 text-xs font-bold px-3 py-1.5 rounded-full shadow-md"
            style={{ background: "var(--brand-primary)", color: "var(--button-text,#fff)" }}
          >
            {DUMMY_PRODUCT.hero_corner_badge}
          </span>
          <img
            src={DUMMY_PRODUCT.main_image}
            alt=""
            className="w-full aspect-square object-cover rounded-2xl shadow-sm"
            style={{ background: "var(--section-bg)" }}
          />
        </div>
      </section>

      <ProductThemedSections
        product={DUMMY_PRODUCT}
        theme={theme}
        setting={{ offer_enabled: true, offer_text: "২ টি কিনলে ১ টি ফ্রি", offer_end_at: new Date(Date.now() + 2 * 86400000).toISOString() }}
        trustPoints={DUMMY_TRUST}
      />
      </div>
    </div>
  );
}

export default function ThemePreviewPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading preview…</div>}>
      <PreviewBody />
    </Suspense>
  );
}
