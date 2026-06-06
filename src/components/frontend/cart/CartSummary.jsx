import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaLock, FaTimes } from "react-icons/fa";
import MiniSpinner from "@/components/shared/loader/MiniSpinner";
import useGetSettingData from "@/components/lib/getSettingData";

const CartSummary = ({
  totalDiscount,
  shippingCharge,
  userInfo,
  shopSubtotals,
  shopGrandTotals,
  couponData,
  shopProduct,
  setCouponCode,
  panelOwnerIds,
  isApplyingCoupon,
  handleApplyCoupon,
  handleRemoveCoupon,
  handleShowCouponInput,
  division,
  loading,
}) => {
  const { data: settingsData, isLoading: siteSettingLoading } =
    useGetSettingData();

  const currencySymbol = settingsData?.data[0];
  return (
    <div className="">
      <div className="  mt-6  bg-white shadow-lg p-4 ">
        <div className="flex justify-between items-center flex-wrap">
          <p className="text-text-Lightest">Location</p>
          {/* <select
            name="location"
            id="location"
            className="text-text-Lighter outline-none   p-1"
            onChange={(e) => setLocation(e.target.value)}
            value={location}
          >
            <option value="Inside Dhaka">Inside Dhaka</option>
            <option value="Outside Dhaka">Outside Dhaka</option>
          </select> */}

          <p className="text-text-Lightest">
            {division == "Dhaka" ? "Inside Dhaka" : "Outside Dhaka"}
          </p>
        </div>

        <hr />

        <div className="flex justify-between  mt-4">
          <p className="text-text-Lightest">Subtotal</p>
          <p className="text-text-Lightest">
            {" "}
            <span className=" font-bold ">
              {" "}
              {!siteSettingLoading && currencySymbol?.currency_symbol}
            </span>{" "}
            {shopSubtotals}
          </p>
        </div>

        <hr className="mt-1" />

        {/* Coupon Section — 11β D6: anonymous allowed. BE accepts BOGO codes
            without customer_id; non-BOGO codes for anon users get a 400 toast. */}
        <div>
          {(
            <div className="">
              {couponData ? (
                <div className="flex justify-between items-center mt-4 p-4    shadow-md">
                  <div className="flex items-center">
                    <p className="text-text-Lightest  mr-2 text-sm sm:text-base">
                      Coupon Code:
                    </p>
                    <span className="bg-primary text-white px-2   ">
                      {couponData?.coupon_code}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="text-red-500 hover:underline flex items-center text-sm sm:text-base"
                    onClick={() => handleRemoveCoupon(shopProduct?._id)}
                  >
                    <FaTimes className="mr-1" />
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  {" "}
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-text-Lighter">Apply Coupon</p>
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => handleShowCouponInput(shopProduct?._id)}
                    >
                      {/* {panelOwnerIds === shopProduct?._id
                        ? "Cancel"
                        : "Enter Your Coupon"} */}
                    </button>
                  </div>
                  <div
                    className={`transition-all duration-500 overflow-hidden ${
                      panelOwnerIds === shopProduct?._id
                        ? "max-h-40 mt-2"
                        : "max-h-0"
                    }`}
                  >
                    {panelOwnerIds === shopProduct?._id && (
                      <div className="flex items-center mt-2">
                        <input
                          type="text"
                          className="border   p-2 w-full"
                          placeholder="Enter coupon code"
                          onChange={(e) => setCouponCode(e.target.value)}
                        />
                        <Button
                          type="button"
                          size="lg"
                          className="bg-primary   text-white p-2 ml-2"
                          onClick={() => handleApplyCoupon(shopProduct?._id)}
                          disabled={isApplyingCoupon}
                        >
                          {isApplyingCoupon ? "Applying..." : "Apply"}
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <hr className="mt-1" />

        {/* Coupon Section */}

        <div className="flex justify-between mt-4">
          <p className="text-text-Lightest">Total Discount</p>
          <p className="text-text-Lightest">
            <span className="font-bold">
              {!siteSettingLoading && currencySymbol?.currency_symbol}
            </span>
            {totalDiscount > 0 ? `-${totalDiscount}` : totalDiscount}
          </p>
        </div>
        <hr className="mt-1" />
        <div className="flex justify-between  mt-4">
          <p className="text-text-Lightest">Shipping</p>
          <p className="text-text-Lightest">
            {" "}
            <span className=" font-bold ">
              {" "}
              {!siteSettingLoading && currencySymbol?.currency_symbol}
            </span>{" "}
            {shippingCharge}
          </p>
        </div>

        <div className="flex justify-between mt-4">
          <p className="text-text-Lightest">Total</p>
          <p className="text-text-Lightest">
            {" "}
            <span className=" font-bold ">
              {" "}
              {!siteSettingLoading && currencySymbol?.currency_symbol}
            </span>{" "}
            {shopGrandTotals}
          </p>
        </div>
        <hr className="mt-1" />

        <div className="flex my-2 gap-2 mt-4">
          {loading == true ? (
            <div className="px-10 py-2 flex items-center w-full justify-center  bg-primary text-white rounded">
              <MiniSpinner />
            </div>
          ) : (
            <Button className="w-full" type="submit" variant="default">
              Placed Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
