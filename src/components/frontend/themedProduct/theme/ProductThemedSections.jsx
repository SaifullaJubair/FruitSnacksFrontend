// One container that wraps all themed sections for a product. Injects CSS vars,
// merges theme + theme_overrides once, and renders each section. Each section
// gracefully no-ops when its data is empty, so partially populated products
// (e.g. just a theme but no benefits yet) still look good.

import VideoSection from "./sections/VideoSection";
import BenefitsUseCasesSection from "./sections/BenefitsUseCasesSection";
import NutritionSection from "./sections/NutritionSection";
import ReviewsSection from "./sections/ReviewsSection";
import FaqSection from "./sections/FaqSection";
import OfferBanner from "./sections/OfferBanner";
import RelatedProductsThemed from "./sections/RelatedProductsThemed";
import { mergeTheme } from "@/lib/theme/mergeTheme";

// Renders the lower content sections only. The hero + order + variant UI now
// lives inside the themed SingleProduct hub, and ThemeStyleInjector +
// AnnouncementBar are injected page-level (see products/[slug]/page.js).
// So this component is purely: benefits → use cases → nutrition → faq.
export default function ProductThemedSections({ product, theme: passedTheme, setting, trustPoints }) {
  if (!product) return null;

  const baseTheme =
    product.theme_id && typeof product.theme_id === "object"
      ? product.theme_id
      : null;
  const theme = passedTheme || mergeTheme(baseTheme, product.theme_overrides);

  const hasContent =
    product.main_video ||
    (product.process_steps?.length || 0) > 0 ||
    (product.benefits?.length || 0) > 0 ||
    (product.use_cases?.length || 0) > 0 ||
    product.nutrition ||
    (trustPoints?.length || 0) > 0 ||
    (product.faqs?.length || 0) > 0;

  if (!hasContent) return null;

  return (
    <div className="themed-product-page" style={{ background: "var(--page-bg)" }}>
      <VideoSection product={product} theme={theme} />
      <BenefitsUseCasesSection product={product} theme={theme} />
      <NutritionSection product={product} theme={theme} trustPoints={trustPoints} />
      <ReviewsSection product={product} theme={theme} />
      <RelatedProductsThemed product_slug={product?.product_slug} />
      <FaqSection product={product} theme={theme} />
      <OfferBanner product={product} setting={setting} />
    </div>
  );
}
