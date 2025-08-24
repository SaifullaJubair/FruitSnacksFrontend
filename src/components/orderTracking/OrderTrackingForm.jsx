"use client";
import { useForm } from "react-hook-form";
import { BASE_URL } from "../utils/baseURL";
import { toast } from "react-toastify";

const OrderTrackingForm = ({ setOrder }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleOnSubmit = async (data) => {
    try {
      const sendData = {
        order_id: data?.order_id,
      };

      const response = await fetch(`${BASE_URL}/order/order_tracking`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sendData),
      });
      const result = await response.json();
      setOrder(result);
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success(
          result?.message ? result?.message : "Tracking successfully",
          {
            autoClose: 1000,
          }
        );
      } else {
        toast.error(result?.message || "Something went wrong", {
          autoClose: 1000,
        });
      }
    } catch (error) {
      toast.error(error?.message, {
        autoClose: 1000,
      });
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit(handleOnSubmit)}>
        <div className="grid grid-cols-1 gap-6 mt-4">
          <div>
            <label className="text-gray-700" htmlFor="order_id">
              <span>Order Id</span>
              <span className="text-danger">*</span>
            </label>
            <input
              id="order_id"
              placeholder="order id"
              type="text"
              className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200   focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40  focus:outline-none focus:ring"
              {...register("order_id", { required: "Order Id is required!" })}
            />
            {errors?.order_id && (
              <span className="text-danger">{errors?.order_id?.message}</span>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          {/* {isLoading ? (
            <button
              disabled
              className="px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-gray-700   hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
            >
              <MiniSpinner />
            </button>
          ) : (
            <button
              type="submit"
              className="px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-gray-700   hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
            >
              Track
            </button>
          )} */}
          <button
            type="submit"
            className="px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-primary   hover:bg-primaryVariant-400 focus:outline-none focus:bg-gray-600"
          >
            Track
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderTrackingForm;
