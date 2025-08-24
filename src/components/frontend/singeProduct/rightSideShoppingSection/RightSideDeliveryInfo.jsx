import { divisions } from "@/data/divisions";
import { cities } from "@/data/cites";
import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa6";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Select from "react-select";
import "react-phone-number-input/style.css";
import "react-phone-number-input/style.css";
import PhoneInput, {
  formatPhoneNumber,
  isPossiblePhoneNumber,
  isValidPhoneNumber,
} from "react-phone-number-input";

const RightSideDeliveryInfo = ({
  register,
  userInfo,
  errors,
  setDivision,
  setDistrictId,
  setDivisionID,
  setDistrict,
  setIsOpenDistrict,
  isOpenDistrict,
  districtsData,
  division,
  district,
  watch,
  loading,
  isAccordionOpen,
  setIsAccordionOpen,
  customer_phone,
  setUserPhone,
  setUserPhoneLogin,
  refetchZone,
  zoneLoading,
  zoneData,
}) => {
  // const [showPassword, setShowPassword] = useState(false);
  // const [showConformPassword, setShowConformPassword] = useState(false);
  console.log(zoneData)

  if (loading) {
    return (
      <div className="bg-white shadow-md   p-4 mb-2">
        <Skeleton height={12} width="60%" className="mb-4" />
        <Skeleton height={10} className="mb-4" />
      </div>
    );
  }
  // console.log(userInfo);
  return (
    <div className="bg-white shadow-md    p-4 mb-2">
      <div
        className="cursor-pointer text-xl mb-2 flex justify-between items-center"
        onClick={() => setIsAccordionOpen(!isAccordionOpen)}
      >
        <h5 className="text-text-light">Delivery Information</h5>
        <span
          className={`transform transition-transform duration-300 ${
            isAccordionOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          <FaChevronDown />
        </span>
      </div>
      <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden transition-all duration-500 ease-in-out ${
          isAccordionOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div>
          <label htmlFor="" className="block text-xs font-medium text-gray-700">
            Name
          </label>

          <input
            {...register("customer_name", {
              required: "Name is required",
            })}
            type="text"
            readOnly={userInfo?.data ? true : false}
            value={userInfo?.data?.user_name}
            placeholder="Your Name"
            className="mt-2 w-full   border-gray-200 shadow-sm sm:text-sm p-2 border-2"
          />
          {errors.customer_name && (
            <p className="text-red-600 text-sm ml-2">
              {errors.customer_name?.message}
            </p>
          )}
        </div>
        <div className="">
          <label
            htmlFor=""
            className="block text-xs  font-medium text-gray-700"
          >
            Phone Number
          </label>

          {/* <input
            {...register("customer_phone", {
              required: "Phone number is required",
              pattern: {
                value: /^(?:\+88|88)?(01[3-9]\d{8})$/,
                message: "Invalid Bangladeshi phone number",
              },
            })}
            type="number"
            defaultValue={
              userInfo?.data?.user_phone &&
              userInfo?.data?.user_phone?.startsWith("+88")
                ? userInfo?.data?.user_phone?.slice(3)
                : userInfo?.data?.user_phone
            }
            placeholder="Your Phone"
            className="mt-2 w-full   border-gray-200 shadow-sm sm:text-sm p-2 border-2"
          />
          {errors.customer_phone && (
            <p className="text-red-600 text-sm ml-2">
              {errors.customer_phone?.message}
            </p>
          )} */}
          {userInfo?.data?.user_phone ? (
            <div>
              <input
                {...register("customer_phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^(?:\+88|88)?(01[3-9]\d{8})$/,
                    message: "Invalid Bangladeshi phone number",
                  },
                })}
                onChange={() => setUserPhoneLogin(true)}
                type="number"
                defaultValue={userInfo?.data?.user_phone}
                placeholder="Your Phone"
                className="mt-2 w-full   border-gray-200 shadow-sm sm:text-sm p-2 border-2"
              />
              {errors.customer_phone && (
                <p className="text-red-600 text-sm ml-2">
                  {errors.customer_phone?.message}
                </p>
              )}
            </div>
          ) : (
            <PhoneInput
              className="custom-phone-input w-full   mt-2 border border-white-light bg-white px-4 py-2 text-sm text-black placeholder:text-white-dark"
              placeholder="Enter phone number"
              id="customer_phone"
              value={customer_phone}
              defaultCountry="BD"
              international
              countryCallingCodeEditable={false}
              countries={["BD"]}
              onChange={setUserPhone}
              error={
                customer_phone
                  ? !isValidPhoneNumber(customer_phone) &&
                    "Invalid phone number"
                  : "Phone number required"
              }
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            city
          </label>
          <Select
            id="city"
            name="city"
            placeholder="Select a city"
            options={cities}
            value={division ? { city_name: division } : null}
            getOptionLabel={(x) => x?.city_name}
            getOptionValue={(x) => x?.city_id}
            onChange={(selectedOption) => {
              refetchZone();
              setIsOpenDistrict(false);
              setDistrict();
              setDistrictId();
              setDivisionID(selectedOption?.city_id);
              setDivision(selectedOption?.city_name);
              setTimeout(() => {
                setIsOpenDistrict(true);
              }, 100);
            }}
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({
                ...base,
                zIndex: 999,
              }), // Set a high z-index
            }}
          ></Select>
        </div>
        {(isOpenDistrict || zoneLoading) && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Zone
            </label>
            <Select
              id="Zone"
              name="Zone"
              placeholder="Select Zone"
              options={zoneData?.data}
              value={district ? { zone_name: district } : null}
              getOptionLabel={(x) => x?.zone_name}
              getOptionValue={(x) => x?.zone_id}
              onChange={(selectedOption) => {
                setDistrict(selectedOption?.zone_name);
                setDistrictId(selectedOption?.zone_id);
              }}
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 999,
                }), // Set a high z-index
              }}
            ></Select>
          </div>
        )}
        <div className=" lg:col-span-2 col-span-1">
          <label htmlFor="" className="block text-xs font-medium text-gray-700">
            Address
          </label>

          <input
            {...register("address", {
              required: "Fill the address",
            })}
            type="text"
            defaultValue={userInfo?.data?.user_address}
            placeholder="Your Address"
            className="mt-2 w-full   border-gray-200 shadow-sm sm:text-sm p-2 border-2"
          />
          {errors.address && (
            <p className="text-red-600 text-sm ml-2">
              {errors.address?.message}
            </p>
          )}
        </div>
        {/* {!userInfo?.data && (
          <>
            <div>
              <label
                htmlFor=""
                className="block text-xs font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  {...register("user_password", {
                    required: userInfo?.data ? false : "Password is required",
                  })}
                  type={showPassword ? "text" : "password"}
                  placeholder="Your Password"
                  className="mt-2 w-full   border-gray-200 shadow-sm sm:text-sm p-2 border-2 pr-10"
                />
                <span
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer "
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
              {errors.user_password && (
                <p className="text-red-600 text-sm ml-2">
                  {errors.user_password?.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor=""
                className="block text-xs font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  {...register("confirm_password", {
                    required: userInfo?.data
                      ? false
                      : "Please confirm your password",
                    validate: (value) =>
                      value === watch("user_password") ||
                      "Passwords do not match",
                  })}
                  type={showConformPassword ? "text" : "password"}
                  placeholder="Confirm Your Password"
                  className="mt-2 w-full   border-gray-200 shadow-sm sm:text-sm p-2 border-2"
                />
                <span
                  className="absolute right-0 inset-y-0 flex items-center pr-3 cursor-pointer"
                  onClick={() => setShowConformPassword(!showConformPassword)}
                >
                  {showConformPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
              {errors.confirm_password && (
                <p className="text-red-600 text-sm ml-2">
                  {errors.confirm_password?.message}
                </p>
              )}
            </div>
          </>
        )} */}
      </div>
    </div>
  );
};

export default RightSideDeliveryInfo;
