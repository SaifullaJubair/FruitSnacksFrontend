import { cities } from "@/data/cites";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import Select from "react-select";
import { FaMapMarkedAlt, FaStar } from "react-icons/fa";
import "react-phone-number-input/style.css";
const DeliveryInformation = ({
  register,
  userInfo,
  errors,
  districtsData,
  setUserPhoneLogin,
  customer_phone,
  setUserPhone,
  setDivision,
  setDistrictId,
  setDivisionID,
  division,
  district,
  setDistrict,
  setIsOpenDistrict,
  isOpenDistrict,
  refetchZone,
  zoneLoading,
  zoneData,
  // S6 (2026-06-04) — saved-addresses picker. Both props are optional;
  // anonymous (FB-ads) checkout flows never receive them.
  savedAddresses = [],
  onPickSavedAddress,
  // C13 — toggle from Admin → Storefront Behaviour settings.
  showEmailField = true,
}) => {
  return (
    <div className="bg-white shadow-md    p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xl">Delivery Information</p>
        {savedAddresses?.length > 0 && (
          <span className="text-[10px] text-gray-400 hidden sm:block">
            Pick a saved address to auto-fill
          </span>
        )}
      </div>

      {/* S6 — Saved address picker. Renders ONLY for logged-in users with
          at least one saved address; never shown for guest / FB-ads flow. */}
      {savedAddresses?.length > 0 && (
        <div className="border border-gray-100 rounded-lg p-3 mb-4 bg-gray-50">
          <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
            <FaMapMarkedAlt size={12} className="text-primary" />
            Saved addresses
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {savedAddresses.map((addr) => (
              <button
                key={addr._id}
                type="button"
                onClick={() => onPickSavedAddress?.(addr)}
                className={`shrink-0 text-left text-xs px-3 py-2 rounded-lg border transition min-w-[180px] max-w-[220px] bg-white hover:border-primary ${
                  addr.is_default
                    ? "border-primary"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="font-semibold text-gray-800 truncate">
                    {addr.label || addr.recipient_name || "Address"}
                  </span>
                  {addr.is_default && (
                    <FaStar size={9} className="text-primary shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-gray-500 line-clamp-2">
                  {addr.address_line}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label htmlFor="" className="block text-xs font-medium text-gray-700">
            Name
          </label>

          <input
            {...register("customer_name")}
            type="text"
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
          <label htmlFor="" className="block text-xs font-medium text-gray-700">
            Phone Number
          </label>

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
            City
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
        <div className="">
          <label
            htmlFor="address"
            className="block text-xs font-medium text-gray-700"
          >
            Address
          </label>

          <input
            {...register("address", {
              required: "Fill the address",
            })}
            type="text"
            placeholder="Your Address"
            className="mt-2 w-full   border-gray-200 shadow-sm sm:text-sm p-2 border-2"
          />
          {errors.address && (
            <p className="text-red-600 text-sm ml-2">
              {errors.address?.message}
            </p>
          )}
        </div>

        {showEmailField && (
          <div className="">
            <label
              htmlFor="customer_email"
              className="block text-xs font-medium text-gray-700"
            >
              Email (optional)
            </label>
            <input
              {...register("customer_email")}
              type="email"
              defaultValue={userInfo?.data?.user_email}
              placeholder="your@email.com"
              className="mt-2 w-full border-gray-200 shadow-sm sm:text-sm p-2 border-2"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryInformation;
