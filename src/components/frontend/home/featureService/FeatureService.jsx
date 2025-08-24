"use client";

import Contain from "@/components/common/Contain";
import useGetSettingData from "@/components/lib/getSettingData";

import Image from "next/image";

const FeatureService = () => {
  const { data: settingsData } = useGetSettingData();
  const footerData = settingsData?.data[0];
  // console.log(footerData);

  return (
    <Contain>
      <div className="my-6">
        <div className="grid grid-cols-2  md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 gap-x-6 sm:gap-6   bg-gray-100   p-4">
            <Image
              src={footerData?.card_one_logo}
              alt="Card"
              width={40}
              height={40}
            />

            <div>
              <p className="text-xs  sm:text-sm  sm:stroke-text-semiLight text-text-Lighter ">
                {footerData?.card_one_title}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6  bg-gray-100   p-3">
            <Image
              src={footerData?.card_two_logo}
              alt="Card"
              width={40}
              height={40}
            />

            <div>
              <p className="text-xs tracking-wider sm:text-sm text-text-Lighter ">
                {footerData?.card_two_title}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 gap-x-6 sm:gap-6   bg-gray-100   p-3">
            <Image
              src={footerData?.card_three_logo}
              alt="Card"
              width={40}
              height={40}
            />

            <div>
              <p className="text-xs tracking-wider sm:text-sm text-text-Lighter ">
                {footerData?.card_three_title}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 gap-x-6 sm:gap-6   bg-gray-100   p-3">
            <Image
              src={footerData?.card_four_logo}
              alt="Card"
              width={40}
              height={40}
            />

            <div>
              <p className="text-xs tracking-wider sm:text-sm text-text-Lighter ">
                {footerData?.card_four_title}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Contain>
  );
};

export default FeatureService;
