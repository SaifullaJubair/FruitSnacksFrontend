// src/components/lib/getServerSettingData.js
import { BASE_URL } from "../utils/baseURL";

export async function getServerSettingData() {
  const res = await fetch(`${BASE_URL}/setting`, {
    next: {
      revalidate: 1800, // 30 minutes
    },
  });

  if (!res.ok) {
    throw new Error("Setting Data fetching error!");
  }

  return res.json();
}
