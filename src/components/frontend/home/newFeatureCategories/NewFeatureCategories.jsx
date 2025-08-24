import { getMenu } from "@/components/lib/getMenu";
import React from "react";
import NewFeatureCategorySwiper from "./NewFeatureCategorySwiper";
import { yatra } from "@/utils/font";

const NewFeatureCategories = async () => {
  const data = await getMenu();
  const featureData = data?.data?.filter(
    (item) => item?.category?.feature_category_show === true
  );
  return (
    <>
      <div className="my-16 max-w-[98%] mx-auto">
        <div className="mb-8">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl  font-bold  text-gray-900 text-center"
            style={{
              fontFamily: yatra.style.fontFamily,
            }}
          >
            Feature <span className="text-primaryVariant-500">Category</span>
          </h2>
          <h6 className="text-center text-gray-600 text-sm">Explore more</h6>
        </div>
        <NewFeatureCategorySwiper featureData={featureData} />
      </div>
    </>
  );
};

export default NewFeatureCategories;
