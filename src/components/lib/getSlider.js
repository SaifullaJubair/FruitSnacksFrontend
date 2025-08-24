import { BASE_URL } from "../utils/baseURL";

export async function getSlider() {
  const res = await fetch(`${BASE_URL}/slider`, {
    next: {
      revalidate: 30,
    },
  });

  if (!res.ok) {
    throw new Error("Slider fetching error!");
  }

  return res.json();
}
