// src/components/frontend/auth/setPassword/SetPassword.jsx
"use client";
import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { BASE_URL } from "@/components/utils/baseURL";
import Contain from "@/components/common/Contain";
import MiniSpinner from "@/components/shared/loader/MiniSpinner";
import {
  FiShield,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiArrowRight,
  FiLogIn,
  FiRefreshCw,
} from "react-icons/fi";
import { HiOutlineDeviceMobile } from "react-icons/hi";

// ── OTP Input ──────────────────────────────────────────────────────────────────
const OTPInput = ({ value, onChange, disabled }) => {
  const digits = (value || "").split("").concat(Array(4).fill("")).slice(0, 4);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits];
    next[i] = val.slice(-1);
    onChange(next.join(""));
    if (val && i < 3) document.getElementById(`sp-otp-${i + 1}`)?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0)
      document.getElementById(`sp-otp-${i - 1}`)?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    onChange(p.padEnd(4, "").slice(0, 4));
    setTimeout(() => document.getElementById(`sp-otp-3`)?.focus(), 0);
  };

  return (
    <div className="flex gap-3 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          id={`sp-otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`w-14 h-14 text-center text-xl font-bold border-2 rounded-2xl outline-none transition-all duration-200 disabled:opacity-40
            ${
              d
                ? "border-primary bg-primary/8 text-primary shadow-sm shadow-primary/20"
                : "border-gray-200 bg-white focus:border-primary focus:shadow-sm focus:shadow-primary/10"
            }`}
        />
      ))}
    </div>
  );
};

// ── Step Bar ───────────────────────────────────────────────────────────────────
const StepBar = ({ step, steps }) => (
  <div className="flex items-center justify-center gap-0 mb-10">
    {steps.map((label, i) => (
      <div key={i} className="flex items-center">
        <div className="flex flex-col items-center gap-1.5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500
            ${
              step > i
                ? "bg-green-500 text-white shadow-md shadow-green-200"
                : step === i
                  ? "bg-primary text-white shadow-md shadow-primary/30 scale-110"
                  : "bg-gray-100 text-gray-400"
            }`}
          >
            {step > i ? <FiCheckCircle size={15} /> : i + 1}
          </div>
          <span
            className={`text-[10px] font-semibold tracking-wide uppercase transition-colors duration-300
            ${step === i ? "text-primary" : step > i ? "text-green-500" : "text-gray-300"}`}
          >
            {label}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div
            className={`w-16 h-[2px] mb-5 mx-1 rounded-full transition-all duration-500
            ${step > i ? "bg-green-400" : "bg-gray-100"}`}
          />
        )}
      </div>
    ))}
  </div>
);

// ── Password Input ─────────────────────────────────────────────────────────────
const PasswordInput = ({
  id,
  placeholder,
  register,
  name,
  rules,
  errors,
  show,
  onToggle,
}) => (
  <div>
    <div className="relative">
      <FiLock
        size={15}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        {...register(name, rules)}
        className="w-full pl-11 pr-12 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
      </button>
    </div>
    {errors?.[name] && (
      <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
        <span>⚠</span> {errors[name].message}
      </p>
    )}
  </div>
);

// ── Left Panel ─────────────────────────────────────────────────────────────────
const LeftPanel = ({ step }) => {
  const content = [
    {
      icon: "🔐",
      title: "Verify Your Number",
      desc: "We'll send a one-time code to confirm it's really you.",
    },
    {
      icon: "📱",
      title: "Enter the Code",
      desc: "Check your phone for the 4-digit OTP we just sent.",
    },
    {
      icon: "🛡️",
      title: "Set Your Password",
      desc: "Create a strong password to keep your account safe.",
    },
    {
      icon: "✅",
      title: "You're Protected!",
      desc: "Your account is now secured. Login to track all your orders.",
    },
  ];

  const c = content[step] || content[0];

  return (
    <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-10 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/3 rounded-full" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-12">
          <FiShield size={22} className="text-white/80" />
          <span className="text-white/80 text-sm font-semibold tracking-wider uppercase">
            Account Security
          </span>
        </div>

        <div className="space-y-6">
          <div className="text-5xl">{c.icon}</div>
          <div>
            <h2 className="text-2xl font-bold mb-2 leading-tight">{c.title}</h2>
            <p className="text-white/70 text-sm leading-relaxed">{c.desc}</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 space-y-3">
        {[
          "Your data is encrypted",
          "OTP expires in 10 minutes",
          "Set password anytime",
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 text-white/60 text-xs"
          >
            <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <FiCheckCircle size={9} />
            </div>
            {t}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main Content ───────────────────────────────────────────────────────────────
const SetPasswordContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const phoneParam = searchParams.get("phone") || "";

  // steps: 0=send OTP, 1=enter OTP, 2=set password, 3=done
  const [step, setStep] = useState(0);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true); // check verified status on load
  const [timer, setTimer] = useState(0);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm();
  const password = watch("user_password");

  // Timer countdown
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // ✅ Page load: check if already verified
  useEffect(() => {
    if (!phoneParam) {
      setChecking(false);
      return;
    }
    const checkUser = async () => {
      try {
        // Use forget password to check if user exists
        // We don't have a public "check user" endpoint, so we check via order or just proceed
        // Best approach: try to get user info — but we don't have a public endpoint
        // So we store verified status in localStorage when password is set
        const verifiedPhone = localStorage.getItem("verified_phone");
        if (verifiedPhone === phoneParam) {
          setAlreadyVerified(true);
        }
      } catch {
      } finally {
        setChecking(false);
      }
    };
    checkUser();
  }, [phoneParam]);

  const handleSendOTP = async () => {
    if (!phoneParam) {
      toast.error("Phone number missing");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/user/forgetPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_phone: phoneParam }),
      });
      const data = await res.json();
      if (data?.success) {
        toast.success("OTP sent to your phone!");
        setTimer(60);
        setStep(1);
      } else {
        toast.error(data?.message || "Failed to send OTP");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 4) {
      toast.error("Enter 4-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/user/verifyOTP`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_phone: phoneParam, user_otp: otp }),
      });
      const data = await res.json();
      if (data?.success) {
        setStep(2);
      } else {
        toast.error(data?.message || "Invalid OTP");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/user/resend_otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_phone: phoneParam }),
      });
      const data = await res.json();
      if (data?.success) {
        toast.success("New OTP sent!");
        setTimer(60);
        setOtp("");
      } else toast.error(data?.message);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (data) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/user/setNewPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_phone: phoneParam,
          user_otp: otp,
          user_password: data.user_password,
        }),
      });
      const result = await res.json();
      if (result?.success) {
        // ✅ Mark as verified in localStorage
        localStorage.setItem("verified_phone", phoneParam);
        localStorage.removeItem("unverified_guest_phone");
        sessionStorage.removeItem("banner_dismissed");
        toast.success("Password set successfully!");
        reset();
        setStep(3);
      } else {
        toast.error(result?.message || "Failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    router.push(`/sign-in?phone=${encodeURIComponent(phoneParam)}`);
  };

  // Loading state
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Already verified — redirect to login
  if (alreadyVerified) {
    return (
      <Contain>
        <div className="min-h-[80vh] flex items-center justify-center py-12">
          <div className="w-full max-w-md text-center">
            <div className="bg-white rounded-3xl shadow-xl p-10">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <FiLogIn size={36} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Already Secured!
              </h2>
              <p className="text-gray-500 text-sm mb-2">
                আপনি আগেই password set করেছেন।
              </p>
              <p className="text-gray-400 text-xs mb-8">{phoneParam}</p>
              <button
                onClick={goToLogin}
                className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                <FiLogIn size={16} /> Login to Your Account
              </button>
              <button
                onClick={() => router.push("/forget-password")}
                className="w-full mt-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Forgot password? Reset it
              </button>
            </div>
          </div>
        </div>
      </Contain>
    );
  }

  const stepLabels = ["Send", "Verify", "Password", "Done"];

  return (
    <Contain>
      <div className="min-h-[85vh] flex items-center justify-center py-10">
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
            {/* Left Panel */}
            <LeftPanel step={step} />

            {/* Right Panel */}
            <div className="p-8 md:p-10">
              {/* Mobile header */}
              <div className="lg:hidden flex items-center gap-2 mb-6">
                <FiShield size={18} className="text-primary" />
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Set Password
                </span>
              </div>

              <StepBar step={step} steps={stepLabels} />

              {/* Phone pill */}
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 mb-8">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <HiOutlineDeviceMobile size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                    Account Phone
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {phoneParam}
                  </p>
                </div>
              </div>

              {/* ── Step 0: Send OTP ─────────────────────────────────────── */}
              {step === 0 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-gray-800">
                      Secure Your Account
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      আপনার account আছে কিন্তু password set করা হয়নি।
                      <br />
                      নিচের button এ click করলে আপনার phone এ OTP যাবে।
                    </p>
                  </div>
                  <button
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="w-full py-3.5 bg-primary text-white font-semibold rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    {loading ? (
                      <MiniSpinner />
                    ) : (
                      <>
                        <FiShield size={16} />
                        <span>Send OTP to My Phone</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* ── Step 1: Enter & Verify OTP ───────────────────────────── */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center space-y-1">
                    <h3 className="text-xl font-bold text-gray-800">
                      Enter OTP
                    </h3>
                    <p className="text-gray-500 text-sm">
                      আপনার phone এ আসা 4-digit code টি দিন
                    </p>
                  </div>

                  <OTPInput value={otp} onChange={setOtp} disabled={loading} />

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={timer > 0}
                      className={`text-xs flex items-center gap-1.5 mx-auto transition-colors
                        ${timer > 0 ? "text-gray-300 cursor-not-allowed" : "text-primary hover:text-primary/70"}`}
                    >
                      <FiRefreshCw size={11} />
                      {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
                    </button>
                  </div>

                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length !== 4}
                    className="w-full py-3.5 bg-primary text-white font-semibold rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    {loading ? (
                      <MiniSpinner />
                    ) : (
                      <>
                        <span>Verify OTP</span>
                        <FiArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* ── Step 2: Set Password ─────────────────────────────────── */}
              {step === 2 && (
                <form
                  onSubmit={handleSubmit(handleSetPassword)}
                  className="space-y-5"
                >
                  <div className="text-center space-y-1">
                    <h3 className="text-xl font-bold text-gray-800">
                      Create Password
                    </h3>
                    <p className="text-gray-500 text-sm">
                      একটি শক্তিশালী password তৈরি করুন
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      New Password
                    </label>
                    <PasswordInput
                      id="pw"
                      placeholder="Minimum 6 characters"
                      register={register}
                      name="user_password"
                      rules={{
                        required: "Password required",
                        minLength: { value: 6, message: "Min 6 characters" },
                      }}
                      errors={errors}
                      show={showPw}
                      onToggle={() => setShowPw(!showPw)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Confirm Password
                    </label>
                    <PasswordInput
                      id="cpw"
                      placeholder="Re-enter your password"
                      register={register}
                      name="confirm_password"
                      rules={{
                        required: "Required",
                        validate: (v) =>
                          v === password || "Passwords do not match",
                      }}
                      errors={errors}
                      show={showConfirm}
                      onToggle={() => setShowConfirm(!showConfirm)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-primary text-white font-semibold rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mt-2"
                  >
                    {loading ? (
                      <MiniSpinner />
                    ) : (
                      <>
                        <FiShield size={16} />
                        <span>Set Password</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ── Step 3: Done ─────────────────────────────────────────── */}
              {step === 3 && (
                <div className="text-center space-y-6">
                  <div className="space-y-3">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                      <FiCheckCircle size={40} className="text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">
                        All Done! 🎉
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        আপনার password সফলভাবে set হয়েছে।
                        <br />
                        এখন login করে সব order দেখতে পারবেন।
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={goToLogin}
                    className="w-full py-3.5 bg-primary text-white font-semibold rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    <FiLogIn size={16} /> Login Now
                  </button>

                  <button
                    onClick={() => router.push("/")}
                    className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Go to Home
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Contain>
  );
};

export default function SetPassword() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SetPasswordContent />
    </Suspense>
  );
}
