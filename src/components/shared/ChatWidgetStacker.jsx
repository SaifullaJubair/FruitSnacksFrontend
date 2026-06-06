"use client";

import { useEffect } from "react";
import useGetSettingData from "@/components/lib/getSettingData";
import { FaFacebookMessenger } from "react-icons/fa";

const ChatWidgetStacker = () => {
  const { data: settingData } = useGetSettingData();
  const setting = settingData?.data?.[0];

  const messengerEnabled = setting?.chat_messenger_enabled;
  const messengerPageId = setting?.chat_messenger_page_id;
  const livechatEnabled = setting?.chat_livechat_enabled;
  const position = setting?.chat_widgets_position || "bottom-right";

  // Inject live-chat embed code once enabled + available
  // Note: embed code is NOT in the public /setting response (it's in SETTING_SECRET_FIELDS)
  // The live-chat embed is injected server-side via layout instead — this component handles
  // the Messenger button only; live-chat comes from a separate server-side script inject
  useEffect(() => {
    if (!messengerEnabled || !messengerPageId) return;
    if (document.getElementById("fb-messenger-sdk")) return;

    window.fbAsyncInit = function () {
      FB.init({ xfbml: true, version: "v18.0" });
    };

    const script = document.createElement("script");
    script.id = "fb-messenger-sdk";
    script.src = "https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, [messengerEnabled, messengerPageId]);

  if (!messengerEnabled || !messengerPageId) return null;

  const positionClass =
    position === "bottom-left"
      ? "bottom-36 left-4 md:bottom-24 md:left-6"
      : "bottom-36 right-4 md:bottom-24 md:right-6";

  return (
    <>
      {/* FB Customer Chat plugin root — SDK injects the actual chat bubble */}
      {messengerEnabled && messengerPageId && (
        <>
          <div id="fb-root" />
          <div
            className="fb-customerchat"
            attribution="biz_inbox"
            page_id={messengerPageId}
          />
        </>
      )}

      {/* Fallback visible Messenger button if plugin doesn't load */}
      <a
        href={`https://m.me/${messengerPageId}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on Messenger"
        className={`fixed ${positionClass} z-50 w-12 h-12 bg-[#0099FF] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform`}
      >
        <FaFacebookMessenger size={24} className="text-white" />
      </a>
    </>
  );
};

export default ChatWidgetStacker;
