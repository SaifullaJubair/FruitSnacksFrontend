"use client";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useChangePasswordMutation,
  useResendOtpMutation,
} from "@/redux/feature/auth/authApi";
import MiniSpinner from "@/components/shared/loader/MiniSpinner";
import { CiLock } from "react-icons/ci";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ChangePassword = () => {
  const [user_phone, setUser_phone] = useState("");
  const [user_name, setUser_name] = useState("");
  const [timerCount, setTimer] = useState(15);
  const [OTPinput, setOTPinput] = useState(["", "", "", ""]);
  const [disable, setDisable] = useState(true);
  const [isPasswordShow, setPasswordShow] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const router = useRouter();

  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [resendOtp] = useResendOtpMutation();

  const handleVerify = async (data) => {
    try {
      const otp = OTPinput.join("");
      if (!otp) {
        toast.error("Must be send OTP !", {
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
        user_otp: otp,
        user_password: data?.user_password,
      };
      const res = await changePassword(sendData);
      if (res?.data?.success) {
        toast.success(res?.data?.message, {
          autoClose: 100,
        });
        localStorage.removeItem("forget_user_phone");
        localStorage.removeItem("forget_user_name");
        reset();
        router.push("/sign-in");
      } else if (res?.error?.status === 400) {
        toast.error(res?.error?.data?.message);
      }
    } catch (error) {
      console.error("otp verified error", error);
    } finally {
      console.log("done");
    }
  };

  const handleResend = async () => {
    try {
      if (disable) return;
      if (!user_phone || !user_name) {
        toast.error("Something went wrong !", {
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
      const data = {
        user_phone: user_phone,
        user_name: user_name,
      };
      const res = await resendOtp(data);
      if (res.data?.statusCode === 200 && res.data?.success === true) {
        setDisable(true);
        toast.info(res?.data?.message);
        setTimer(15);
      } else {
        toast.error(res.error.data?.message, {
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error("resend otp error", error);
    }
  };

  const handleInputChange = (index, value) => {
    const newOTPinput = [...OTPinput];
    newOTPinput[index] = value;
    setOTPinput(newOTPinput);

    // Automatically move to the next input field if the current field is not the last one
    if (index < newOTPinput.length - 1 && value !== "") {
      document.getElementById(`otpInput-${index + 1}`).focus();
    }
  };

  const handleInputKeyDown = (index, e) => {
    // Move to the previous input field on backspace if the current field is empty
    if (e.key === "Backspace" && index > 0 && OTPinput[index] === "") {
      document.getElementById(`otpInput-${index - 1}`).focus();
    }
  };

  useEffect(() => {
    let interval = setInterval(() => {
      setTimer((lastTimerCount) => {
        lastTimerCount <= 1 && clearInterval(interval);
        if (lastTimerCount <= 1) setDisable(false);
        if (lastTimerCount <= 0) return lastTimerCount;
        return lastTimerCount - 1;
      });
    }, 1000); // each count lasts for a second
    // cleanup the interval on complete
    return () => clearInterval(interval);
  }, [disable]);

  useEffect(() => {
    const user_phone = JSON.parse(localStorage.getItem("forget_user_phone"));
    const user_name = JSON.parse(localStorage.getItem("forget_user_name"));
    if (user_phone) {
      setUser_phone(user_phone);
    }
    if (user_name) {
      setUser_name(user_name);
    }
  }, []);

  return (
    <div className="flex justify-center items-center">
      <div>
        <div className="px-6 pt-10 pb-9 shadow mx-auto w-full  ">
          <div className="mx-auto flex flex-col space-y-3">
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <h4 className="text-primary font-medium mb-0">
                Change Your Password
              </h4>
              <p>We have sent a code to {user_phone}</p>
            </div>

            <form onSubmit={handleSubmit(handleVerify)}>
              <div className="flex flex-col space-y-5">
                <div className="flex flex-row items-center justify-between mx-auto w-full max-w-xs">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="w-12 h-12">
                      <input
                        maxLength="1"
                        id={`otpInput-${index}`}
                        className="w-full h-full flex flex-col items-center justify-center text-center px-5 outline-none  border border-gray-200 text-lg bg-white focus:bg-gray-50 focus:ring-1 ring-blue-700"
                        type="text"
                        onChange={(e) =>
                          handleInputChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleInputKeyDown(index, e)}
                      ></input>
                    </div>
                  ))}
                </div>
                <div>
                  <label htmlFor="Password">Password</label>
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
                <div>
                  <button className="flex flex-row cursor-pointer items-center justify-center text-center w-full border  outline-none py-3 bg-primary border-none text-white text-sm shadow-sm">
                    {isLoading ? <MiniSpinner /> : "Change Password"}
                  </button>
                </div>
              </div>
            </form>
            <div className="flex flex-col space-y-5 max-w-xs mx-auto">
              <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                <p className="mb-0">Did not receive code?</p>{" "}
                <button
                  className={`${
                    disable
                      ? "text-gray-500 cursor-not-allowed"
                      : "cursor-pointer underline"
                  }`}
                  onClick={() => handleResend()}
                >
                  {disable ? `Resend OTP in ${timerCount}s` : "Resend OTP"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
