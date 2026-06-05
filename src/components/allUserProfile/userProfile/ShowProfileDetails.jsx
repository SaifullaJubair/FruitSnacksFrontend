"use client";

import { useEffect, useState } from "react";
import { FaRegEdit, FaEnvelope, FaCheck, FaTimes } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import { toast } from "react-toastify";
import ProfileSetting from "./ProfileSetting";
import { BASE_URL } from "@/components/utils/baseURL";

const ShowProfileDetails = ({ userInfo, refetch }) => {
  const [userupdateModalOpen, setUserupdateModalOpen] = useState(false);
  const [userupdateModaldata, setUserupdateModaldata] = useState();

  // S4+S5 Phase 1C — opt-in email row. Inline editor (no modal) since
  // it hits a separate single-field endpoint and is order-of-magnitude
  // simpler than the full profile-update flow.
  const currentEmail = userInfo?.data?.user_email || "";
  const [emailEditing, setEmailEditing] = useState(false);
  const [emailInput, setEmailInput] = useState(currentEmail);
  const [emailSaving, setEmailSaving] = useState(false);

  useEffect(() => {
    setEmailInput(currentEmail);
  }, [currentEmail]);

  const saveEmail = async () => {
    const val = (emailInput || "").trim();
    if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setEmailSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/user/me/email`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: val }),
      });
      const data = await res.json();
      if (data?.success) {
        toast.success("Email saved.", { autoClose: 1200 });
        setEmailEditing(false);
        refetch?.();
      } else {
        toast.error(data?.message || "Failed to save email.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setEmailSaving(false);
    }
  };

  //updateUser function
  const handleUpdateUser = () => {
    setUserupdateModalOpen(true);
    setUserupdateModaldata();
  };
  return (
    <div>
      <h4 className=" bg-primary  p-4 flex items-center gap-3 text-white mb-2">
        <FiSettings className=" text-2xl text-white" />
        <span>Profile Details</span>
      </h4>
      <div className="my-10 bg-slate-50 shadow relative">
        <button
          className="absolute right-5 top-5 flex items-center text-xl gap-2 font-semibold"
          onClick={() => handleUpdateUser()}
        >
          Edit <FaRegEdit size={30} className="hover:text-gray-500" />
        </button>
        <div className="p-10">
          {" "}
          <div className="mb-10 flex justify-center items-center md:justify-start">
            <img
              src={userInfo?.data?.user_image}
              alt=""
              className="w-[70px] h-[70px] object-cover "
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 text-xl md:text-2xl gap-4 md:gap-10">
            <p>
              {" "}
              <span className="font-medium"> Name : </span>{" "}
              {userInfo?.data?.user_name}
            </p>

            <p>
              {" "}
              <span className="font-medium"> Phone : </span>{" "}
              {userInfo?.data?.user_phone}
            </p>
            <p>
              <span className="font-medium">Country : </span> Bangladesh
            </p>
            <p>
              <span className="font-medium">Division : </span>{" "}
              {userInfo?.data?.user_division}
            </p>
            <p>
              <span className="font-medium">District : </span>{" "}
              {userInfo?.data?.user_district}
            </p>
            <p>
              <span className="font-medium">Address : </span>{" "}
              {userInfo?.data?.user_address}
            </p>
          </div>

          {/* Phase 1C — email row (collapsed inline editor). Used
              for order receipts + Meta CAPI Advanced Matching `em`. */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-3 text-base md:text-lg">
              <FaEnvelope className="text-gray-500" />
              <span className="font-medium">Email :</span>
              {!emailEditing ? (
                <>
                  <span className="text-gray-700">
                    {currentEmail || (
                      <span className="text-gray-400 text-sm italic">
                        not set
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEmailEditing(true)}
                    className="text-sm text-primary underline ml-2"
                  >
                    {currentEmail ? "Change" : "Add email"}
                  </button>
                </>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="you@example.com"
                    maxLength={120}
                    className="border px-3 py-1.5 text-sm rounded outline-primary min-w-[220px]"
                  />
                  <button
                    type="button"
                    onClick={saveEmail}
                    disabled={emailSaving}
                    className="bg-primary text-white px-3 py-1.5 rounded text-sm inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    <FaCheck size={11} />
                    {emailSaving ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailEditing(false);
                      setEmailInput(currentEmail);
                    }}
                    disabled={emailSaving}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded text-sm inline-flex items-center gap-1"
                  >
                    <FaTimes size={11} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Optional — used for order receipts and tracking links. Never
              shared with third parties.
            </p>
          </div>
        </div>
      </div>

      {userupdateModalOpen && (
        <ProfileSetting
          setUserupdateModalOpen={setUserupdateModalOpen}
          userInfo={userInfo}
          refetch={refetch}
        />
      )}
    </div>
  );
};

export default ShowProfileDetails;
