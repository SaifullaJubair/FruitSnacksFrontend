import { BASE_URL } from "@/components/utils/baseURL";

// Browser এর fbc, fbp cookie পড়ো
const getCookieValue = (name) => {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : "";
};

// Backend এ event পাঠাও — silent fail
export const sendServerEvent = async (data) => {
  try {
    await fetch(`${BASE_URL}/meta-pixel/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        event_source_url: window.location.href,
        user_data: {
          ...data.user_data,
          fbc: getCookieValue("_fbc"),
          fbp: getCookieValue("_fbp"),
        },
      }),
    });
  } catch (error) {
    console.warn("Meta server event error:", error);
  }
};
