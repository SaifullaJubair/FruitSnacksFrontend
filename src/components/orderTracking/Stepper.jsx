"use client";
import { useEffect, useState } from "react";
import { TiTick } from "react-icons/ti";

const Stepper = ({ order }) => {
  const steps = ["Pending", "Processing", "Shipped", "Delivered"];
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (order?.pending_time && !order?.processing_time) {
      setCurrentStep(1);
    } else if (order?.processing_time && !order?.shipped_time) {
      setCurrentStep(2);
    } else if (order?.shipped_time && !order?.delivered_time) {
      setCurrentStep(3);
    } else if (order?.delivered_time) {
      setCurrentStep(4);
    }
  }, [order]);

  return (
    <div className="w-full flex justify-center">
      <div className="relative flex items-center justify-between w-full max-w-[700px]">
        {/* Background Line (Behind the Steps) */}
        <div className="absolute top-[20px] w-full left-0  h-[4px] bg-gray-300 -translate-y-1/2 "></div>

        {/* Progress Line (Dynamic Width) */}
        <div
          className="absolute top-[20px] w-full left-0  h-[4px] bg-primary transition-all duration-300 -translate-y-1/2"
          style={{
            width:
              currentStep > 1
                ? `${((currentStep - 1) / (steps.length - 1)) * 100}%`
                : "0%",
            maxWidth: "100%",
          }}
        ></div>

        {steps.map((step, i) => (
          <div key={i} className=" flex flex-col items-center ">
            <div
              className={`w-10 h-10 flex items-center justify-center  border-2 z-10 ${
                i + 1 <= currentStep
                  ? "bg-primary text-white border-primary"
                  : "bg-gray-200 text-gray-500 border-gray-300"
              }`}
            >
              {i + 1 <= currentStep ? <TiTick size={20} /> : i + 1}
            </div>

            {/* Step Labels */}
            <p
              className={`mt-2 font-medium ${
                i + 1 <= currentStep ? "text-primary" : "text-gray-500"
              }`}
            >
              {step}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stepper;
