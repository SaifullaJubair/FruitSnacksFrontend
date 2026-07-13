import { BASE_URL } from "../utils/baseURL";

// Fails soft (returns null) instead of throwing: this now runs inside the RSC
// render path for the home category strip, where an uncaught throw would take
// down the whole page rather than just this one section.
export async function getJustForYouProducts() {
  try {
    const res = await fetch(`${BASE_URL}/product/just_for_you_product`, {
      next: {
        revalidate: 300,
      },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
