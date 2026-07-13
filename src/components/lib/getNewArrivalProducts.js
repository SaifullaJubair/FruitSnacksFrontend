import { BASE_URL } from "../utils/baseURL";

// Server helper for the `new_arrivals` home section (RSC). Fails soft — a dead
// backend must degrade this one section to empty, not 500 the whole homepage
// (there is no error boundary under (frontend)/ today).
export async function getNewArrivalProducts({ page = 1, limit = 8 } = {}) {
  try {
    const res = await fetch(
      `${BASE_URL}/product/new_arrival?page=${page}&limit=${limit}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
