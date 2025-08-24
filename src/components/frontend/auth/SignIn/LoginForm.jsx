"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";
import { CiLock } from "react-icons/ci";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";

import { FaEye, FaEyeSlash, FaShoppingBag } from "react-icons/fa";
import { useUserLoginMutation } from "@/redux/feature/auth/authApi";
import MiniSpinner from "@/components/shared/loader/MiniSpinner";
import Image from "next/image";
import signupImage from "./loginIMg.png";
import "react-phone-number-input/style.css";
import PhoneInput, {
  formatPhoneNumber,
  isPossiblePhoneNumber,
  isValidPhoneNumber,
} from "react-phone-number-input";
import { LoaderOverlay } from "@/components/shared/loader/LoaderOverlay";

const LoginForm = () => {
  const [user_phone, setUserPhone] = useState();
  const [isPasswordShow, setPasswordShow] = useState(false);
  const [userLogin, { isLoading }] = useUserLoginMutation();
  const getQuery = useSearchParams();
  const successRedirect = getQuery.get("success_redirect");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();
  const router = useRouter();

  const submitForm = async (data) => {
    try {
      if (user_phone) {
        const formatPhoneNumberValueCheck = formatPhoneNumber(user_phone);
        const isPossiblePhoneNumberValueCheck =
          isPossiblePhoneNumber(user_phone);
        const isValidPhoneNumberValueCheck = isValidPhoneNumber(user_phone);
        if (formatPhoneNumberValueCheck == false) {
          toast.error("Mobile number not valid !", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          return;
        }
        if (isPossiblePhoneNumberValueCheck == false) {
          toast.error("Mobile number not valid !", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          return;
        }
        if (isValidPhoneNumberValueCheck == false) {
          toast.error("Mobile number not valid !", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          return;
        }
      }

      if (!user_phone) {
        toast.error("Phone is required !", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        return;
      }

      const sendData = {
        user_phone: user_phone,
        user_password: data?.user_password,
      };

      const res = await userLogin(sendData);
      if (res?.data?.statusCode === 200 && res?.data?.success === true) {
        toast.success(res?.data?.message, {
          autoClose: 2000,
        });
        reset();
        if (successRedirect) {
          router.push(successRedirect);
        } else {
          router.push("/");
        }
      } else {
        toast.error(res?.error?.data?.message || "Something went wrong", {
          autoClose: 1000,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      console.log("done");
    }
  };

  return (
    <div className="">
      <div className="sm:grid sm:grid-cols-2 sm:gap-6 md:gap-8 lg:gap-12">
        <div className="bg-primary sm:flex sm:justify-center sm:items-center hidden ">
          <Image src={signupImage} alt="signupImage" width={500} height={500} />
        </div>

        <div className="min-h-screen lg:w-[500px] md:w-[380px] sm:w-[300px] w-[95%] sm:mx-0 mx-auto flex items-center ">
          <div className="w-full">
            <div className="mb-8">
              <FaShoppingBag size={35} className="text-primary" />
              <h2 className="text-primary my-2">WELCOME BACK</h2>
              <p>Login To Your Account</p>
            </div>
            <form className="space-y-5" onSubmit={handleSubmit(submitForm)}>
              <div className="">
                <div>
                  <label htmlFor="user_phone" className="font-medium">
                    Phone
                  </label>

                  <PhoneInput
                    className="custom-phone-input w-full   border border-white-light bg-white px-4 py-2 text-sm text-black placeholder:text-white-dark"
                    placeholder="Enter phone number"
                    id="user_phone"
                    value={user_phone}
                    defaultCountry="BD"
                    international
                    countryCallingCodeEditable={false}
                    onChange={setUserPhone}
                    error={
                      user_phone
                        ? !isValidPhoneNumber(user_phone) &&
                          "Invalid phone number"
                        : "Phone number required"
                    }
                  />
                </div>
              </div>

              <div>
                <label htmlFor="Password" className="font-medium">
                  Password
                </label>
                <span className="text-xs text-danger">*</span>
                <div className="relative text-white-dark">
                  <input
                    id="Password"
                    name="user_password"
                    type={isPasswordShow ? "text" : "password"}
                    placeholder="Enter Password"
                    className="w-full   border border-white-light bg-white px-4 py-2 text-sm text-black !outline-none ps-10 placeholder:text-white-dark"
                    {...register("user_password", {
                      required: "Password is Required!",
                    })}
                  />
                  <span className="absolute start-4 top-1/2 -translate-y-1/2">
                    <CiLock />
                  </span>
                  <span
                    onClick={() => setPasswordShow(!isPasswordShow)}
                    className="absolute end-4 top-1 translate-y-1/2 cursor-pointer"
                  >
                    {isPasswordShow ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                {errors.user_password && (
                  <span className="text-xs text-danger">
                    {errors?.user_password?.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col-reverse lg:flex-row justify-end">
                <Link
                  href="/forget-password"
                  className="flex cursor-pointer items-center"
                >
                  <span className="text-danger underline ml-2">
                    Forget Password
                  </span>
                </Link>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || Object.keys(errors).length > 0}
                className="bg-primary text-white py-[6px]  !mt-6 w-full border-0 font-medium uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
              >
                {isLoading ? <MiniSpinner /> : "Sign in"}
              </button>
            </form>
            <div className="relative my-7 text-center">
              <span className="absolute inset-x-0 top-1/2 w-full -translate-y-1/2 bg-white-light"></span>
              <span className="relative px-2 uppercase text-white-dark">
                or
              </span>
            </div>
            <div className="text-center">
              Don&apos;t have an account ?&nbsp;
              <Link
                href="/sign-up"
                className="uppercase text-primary underline transition hover:text-black font-medium"
              >
                SIGN UP
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// export default LoginForm;

export default function Page() {
  return (
    <Suspense fallback={<LoaderOverlay />}>
      <LoginForm />
    </Suspense>
  );
}
