"use client";

import { useState } from "react";
import useGetSettingData from "@/components/lib/getSettingData";
import CustomLoader from "@/components/shared/loader/CustomLoader";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const ReturnPolicyAccordion = () => {
  const { data: settingsData, isLoading } = useGetSettingData();
  const footerData = settingsData?.data[0];
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div className="border-y my-4">
        {/* Accordion Header */}
        <div
          className=" px-3 flex items-center justify-between py-2 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <p className="text-gray-700 font-semibold">Return Policy</p>
          {isOpen ? (
            <FaChevronUp className="text-[20px] font-light text-gray-600" />
          ) : (
            <FaChevronDown className="text-[20px] font-light text-gray-600" />
          )}
        </div>

        {/* Accordion Body */}
        <div
          className={`grid overflow-hidden transition-all duration-500 ease-in-out ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className=" p-4">
              {isLoading ? (
                <CustomLoader />
              ) : (
                <div
                  className="my-6"
                  dangerouslySetInnerHTML={{
                    __html: footerData?.return_policy,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicyAccordion;
