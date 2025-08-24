"use client";

import { useState } from "react";
import { CiDeliveryTruck } from "react-icons/ci";
import { MdAttachMoney } from "react-icons/md";
import { LiaRedoAltSolid } from "react-icons/lia";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { GoShieldSlash } from "react-icons/go";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
const MobileDeliveryInfoAccordion = ({ product, settingData }) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  // Calculate delivery days
  const minDays = Math.min(
    settingData?.data[0]?.outside_dhaka_shipping_days || 0,
    settingData?.data[0]?.inside_dhaka_shipping_days || 0
  );
  const maxDays = Math.max(
    settingData?.data[0]?.outside_dhaka_shipping_days || 0,
    settingData?.data[0]?.inside_dhaka_shipping_days || 0
  );
  return (
    <div>
      {/* Mobile View (Accordion for sm devices) */}
      <div className=" border-y my-4">
        <div
          className=" px-3 flex items-center justify-between py-2 cursor-pointer"
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
        >
          <p className="text-gray-700 font-semibold">Shipping</p>
          {isAccordionOpen ? (
            <FaChevronUp className="text-[20px] font-light text-gray-600" />
          ) : (
            <FaChevronDown className="text-[20px] font-light text-gray-600" />
          )}
        </div>

        <div
          className={`grid overflow-hidden transition-all duration-500 ease-in-out ${
            isAccordionOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className=" p-4">
              <div className="flex items-center gap-3 my-3">
                <CiDeliveryTruck size={24} />
                <div className="flex flex-col">
                  <p className="font-semibold text-text-light">
                    Standard Delivery
                  </p>
                  <p className="text-text-Lighter text-sm">
                    Guaranteed by {minDays} - {maxDays} days
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 my-3">
                <MdAttachMoney size={24} className="text-text-light" />
                <p className="font-semibold text-text-light">
                  Cash on Delivery Available
                </p>
              </div>

              <hr className="mx-2" />

              <div className="flex items-center gap-3 my-3">
                <LiaRedoAltSolid size={20} />
                <p className="font-semibold text-text-light">
                  {product?.product_return
                    ? `${product?.product_return} Days Return`
                    : "Return Not Available"}
                </p>
              </div>

              <div className="flex items-center gap-3 my-3">
                {product?.product_warrenty ? (
                  <>
                    <IoShieldCheckmarkOutline size={20} />
                    <p className="font-semibold text-text-light">
                      {product?.product_warrenty} Product Warranty
                    </p>
                  </>
                ) : (
                  <>
                    <GoShieldSlash size={20} />
                    <p className="font-semibold text-text-light">
                      Warranty Not Available
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDeliveryInfoAccordion;
