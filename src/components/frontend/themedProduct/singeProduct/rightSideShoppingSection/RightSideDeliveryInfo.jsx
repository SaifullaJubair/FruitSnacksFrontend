"use client";
import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Select from "react-select";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import {
  FiUser,
  FiPhone,
  FiMapPin,
  FiHome,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

// ✅ Theme-aware react-select styles (brand-primary focus ring, 44px height)
const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: "0.75rem",
    borderColor: state.isFocused
      ? "var(--brand-primary, #C04137)"
      : "#e5e7eb",
    boxShadow: state.isFocused
      ? "0 0 0 3px var(--brand-primary-light, rgba(225,29,72,0.15))"
      : "none",
    "&:hover": { borderColor: "var(--brand-primary-light, #9ca3af)" },
    padding: "3px 4px",
    fontSize: "0.875rem",
    minHeight: "46px",
    fontFamily: "var(--brand-font)",
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "0.875rem",
    fontFamily: "var(--brand-font)",
    backgroundColor: state.isSelected
      ? "var(--brand-primary, #C04137)"
      : state.isFocused
        ? "var(--brand-primary-light, #fff1f2)"
        : "white",
    color: state.isSelected ? "var(--button-text, #fff)" : "#374151",
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

const RightSideDeliveryInfo = ({
  register,
  userInfo,
  errors,
  // Geo picker — Division → District → Upazila. division/district keep
  // their PRE-geo-module meaning (display NAME) so billing_city/
  // billing_state and the shipping-cost string-match stay untouched — see
  // docs/_ai/GEO_LOCATION_SELF_HOSTED_PLAN.md Phase 2.
  divisions,
  divisionsLoading,
  division,
  divisionId,
  setDivision,
  districts,
  districtsLoading,
  district,
  districtId,
  setDistrict,
  upazilas,
  upazilasLoading,
  upazila,
  setUpazila,
  watch,
  loading,
  isAccordionOpen,
  setIsAccordionOpen,
  customer_phone,
  setUserPhone,
  setUserPhoneLogin,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
        <Skeleton height={14} width="50%" className="mb-3" />
        <Skeleton height={36} className="mb-2" />
        <Skeleton height={36} />
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-2xl shadow-sm overflow-hidden"
      style={{ fontFamily: "var(--brand-font)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-5 py-4"
        style={{ background: "var(--brand-primary-light)" }}
      >
        <span
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "var(--brand-primary)", color: "var(--button-text, #fff)" }}
        >
          <FiHome size={16} />
        </span>
        <div>
          <p className="text-sm font-bold" style={{ color: "var(--heading-color)" }}>
            অর্ডার তথ্য দিন
          </p>
          <p className="text-[11px]" style={{ color: "var(--body-color)", opacity: 0.7 }}>
            ক্যাশ অন ডেলিভারি · দ্রুত শিপিং
          </p>
        </div>
      </div>

      {/* Body — always open */}
      <div>
        <div className="px-5 py-5 space-y-4">
          {/* Name */}
          <div>
            <label
              className="flex items-center gap-1.5 text-xs font-bold mb-1.5"
              style={{ color: "var(--heading-color)" }}
            >
              <FiUser size={12} style={{ color: "var(--brand-primary)" }} />
              আপনার নাম
            </label>
            <input
              {...register("customer_name", { required: "নাম দিন" })}
              type="text"
              readOnly={!!userInfo?.data}
              defaultValue={userInfo?.data?.user_name}
              placeholder="আপনার পুরো নাম"
              className="themed-input w-full px-3.5 py-3 text-sm rounded-xl border-2 outline-none transition-all placeholder:text-gray-400 bg-white read-only:bg-gray-50 read-only:text-gray-600"
            />
            {errors.customer_name && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>⚠</span> {errors.customer_name?.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              className="flex items-center gap-1.5 text-xs font-bold mb-1.5"
              style={{ color: "var(--heading-color)" }}
            >
              <FiPhone size={12} style={{ color: "var(--brand-primary)" }} />
              মোবাইল নম্বর
            </label>
            {userInfo?.data?.user_phone ? (
              <input
                {...register("customer_phone", {
                  required: "মোবাইল নম্বর দিন",
                  pattern: {
                    value: /^(?:\+88|88)?(01[3-9]\d{8})$/,
                    message: "সঠিক নম্বর দিন",
                  },
                })}
                onChange={() => setUserPhoneLogin(true)}
                type="number"
                defaultValue={userInfo?.data?.user_phone}
                placeholder="01XXXXXXXXX"
                className="themed-input w-full px-3.5 py-3 text-sm rounded-xl border-2 outline-none transition-all"
              />
            ) : (
              <PhoneInput
                className="themed-phone custom-phone-input w-full text-sm rounded-xl border-2 border-gray-200 bg-white px-3.5 py-2.5"
                placeholder="01XXXXXXXXX"
                value={customer_phone}
                defaultCountry="BD"
                international
                countryCallingCodeEditable={false}
                countries={["BD"]}
                onChange={setUserPhone}
              />
            )}
            {errors.customer_phone && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>⚠</span> {errors.customer_phone?.message}
              </p>
            )}
          </div>

          {/* Division + District — stack on mobile (the "সিলেক্ট করুন" label
              wraps and breaks when squeezed into 2 narrow columns), 2-up on
              sm+. Reads our own geo tree, not Pathao's live API — see geo
              module / docs/_ai/GEO_LOCATION_SELF_HOSTED_PLAN.md. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                className="flex items-center gap-1.5 text-xs font-bold mb-1.5"
                style={{ color: "var(--heading-color)" }}
              >
                <FiMapPin size={12} style={{ color: "var(--brand-primary)" }} />
                বিভাগ
              </label>
              <Select
                placeholder="সিলেক্ট করুন"
                options={divisions}
                value={divisionId ? { _id: divisionId, name_en: division } : null}
                isLoading={divisionsLoading}
                getOptionLabel={(x) => x?.name_en}
                getOptionValue={(x) => x?._id}
                onChange={(opt) => {
                  setDistrict(undefined, undefined);
                  setUpazila?.(undefined, undefined);
                  setDivision(opt?._id, opt?.name_en);
                }}
                styles={selectStyles}
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : null
                }
              />
            </div>
            <div>
              <label
                className="flex items-center gap-1.5 text-xs font-bold mb-1.5"
                style={{ color: "var(--heading-color)" }}
              >
                <FiMapPin size={12} style={{ color: "var(--brand-primary)" }} />
                জেলা
              </label>
              <Select
                placeholder="সিলেক্ট করুন"
                options={districts}
                value={districtId ? { _id: districtId, name_en: district } : null}
                isDisabled={!divisionId}
                getOptionLabel={(x) => x?.name_en}
                getOptionValue={(x) => x?._id}
                isLoading={districtsLoading}
                onChange={(opt) => {
                  setUpazila?.(undefined, undefined);
                  setDistrict(opt?._id, opt?.name_en);
                }}
                styles={selectStyles}
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : null
                }
              />
            </div>
          </div>
          <div>
            <label
              className="flex items-center gap-1.5 text-xs font-bold mb-1.5"
              style={{ color: "var(--heading-color)" }}
            >
              <FiMapPin size={12} style={{ color: "var(--brand-primary)" }} />
              থানা/এলাকা{" "}
              <span className="font-normal opacity-60">(ঐচ্ছিক)</span>
            </label>
            <Select
              placeholder="সিলেক্ট করুন (ঐচ্ছিক)"
              options={upazilas}
              value={upazila ? { name_en: upazila } : null}
              isDisabled={!districtId}
              isLoading={upazilasLoading}
              isClearable
              getOptionLabel={(x) => x?.name_en}
              getOptionValue={(x) => x?._id}
              onChange={(opt) => {
                setUpazila?.(opt?._id, opt?.name_en);
              }}
              styles={selectStyles}
              menuPortalTarget={
                typeof document !== "undefined" ? document.body : null
              }
            />
          </div>

          {/* Address */}
          <div>
            <label
              className="flex items-center gap-1.5 text-xs font-bold mb-1.5"
              style={{ color: "var(--heading-color)" }}
            >
              <FiHome size={12} style={{ color: "var(--brand-primary)" }} />
              সম্পূর্ণ ঠিকানা
            </label>
            <input
              {...register("address", { required: "ঠিকানা দিন" })}
              type="text"
              defaultValue={userInfo?.data?.user_address}
              placeholder="বাড়ি, রোড, এলাকা..."
              className="themed-input w-full px-3.5 py-3 text-sm rounded-xl border-2 outline-none transition-all placeholder:text-gray-400"
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>⚠</span> {errors.address?.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSideDeliveryInfo;
