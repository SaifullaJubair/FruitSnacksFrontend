import { BASE_URL } from "../utils/baseURL";

// Server helper for the `reviews_carousel` home section (RSC).
//
// Two modes, both driven by site settings (same behaviour the client version had):
//   auto_featured — public featured endpoint (active + 5-star + has photo)
//   manual_pick   — the exact review ids the admin picked
//
// Fails soft: a dead backend degrades this one section to empty rather than
// 500-ing the whole homepage.
export async function getCarouselReviews({ mode, manualIds = [] } = {}) {
  const url =
    mode === "manual_pick"
      ? manualIds.length
        ? `${BASE_URL}/review/by-ids?ids=${manualIds.join(",")}`
        : null
      : `${BASE_URL}/review/featured?limit=10`;

  if (!url) return null;

  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
