import { BASE_URL } from "../utils/baseURL";


export async function getAllCampaign() {
  const res = await fetch(`${BASE_URL}/campaign`, {
    next: {
      revalidate: 30,
    },
  });

  if (!res.ok) {
    throw new Error("feature campaign fetching error!");
  }

  return res.json();
}
