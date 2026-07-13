import { getCarouselReviews } from "@/components/lib/getCarouselReviews";
import ReviewsCarouselSlider from "./ReviewsCarouselSlider";

/**
 * Reviews carousel — Server Component.
 *
 * Reviews are fetched here rather than in the browser: they are real content
 * (and SEO-relevant), so they belong in the initial HTML. The Swiper itself
 * needs the browser and stays a client leaf, receiving `reviews` as a prop.
 */
const ReviewsCarousel = async ({ settings }) => {
  const mode = settings?.reviews_carousel_mode || "auto_featured";
  const title = settings?.reviews_carousel_title || "What Our Customers Say";

  const manualIds = (() => {
    try {
      const parsed = JSON.parse(settings?.reviews_carousel_ids || "");
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  })();

  const data = await getCarouselReviews({ mode, manualIds });
  const reviews = data?.data ?? [];

  if (!reviews.length) return null;

  return <ReviewsCarouselSlider reviews={reviews} title={title} />;
};

export default ReviewsCarousel;
