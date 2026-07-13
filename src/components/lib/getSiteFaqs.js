import { BASE_URL } from "../utils/baseURL";

// Server helper for the `site_faq` home section (RSC). Fails soft — a dead
// backend degrades this one section to empty, it must not 500 the homepage.
export async function getSiteFaqs() {
  try {
    const res = await fetch(`${BASE_URL}/site-faq/active`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
