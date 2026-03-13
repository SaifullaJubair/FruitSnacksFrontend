"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaFileInvoice } from "react-icons/fa";
import { FiPackage, FiTruck, FiShield, FiLogIn } from "react-icons/fi";
import Contain from "../common/Contain";
import { BASE_URL } from "@/components/utils/baseURL";
import { useUserInfoQuery } from "@/redux/feature/auth/authApi";
import AccountModal from "../frontend/auth/accountModal/AccountModal";

const OrderSuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const invoiceId = searchParams.get("invoice_id");
  const isGuest = searchParams.get("guest") === "true";

  const { data: userInfo, refetch: refetchUser } = useUserInfoQuery();
  const isLoggedIn = !!userInfo?.data?._id;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("full");
  const [orderData, setOrderData] = useState(null);
  const [successState, setSuccessState] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${BASE_URL}/order/${orderId}`);
        const data = await res.json();
        if (data?.success && data?.data?.order) {
          const order = data.data.order;
          setOrderData(order);

          // ✅ Unverified হলে localStorage এ save করো banner এর জন্য
          const verified = order?.customer_id?.user_verified;
          const phone = order?.customer_phone;
          if (!verified && phone && !isLoggedIn) {
            localStorage.setItem("unverified_guest_phone", phone);
          }
        }
      } catch {}
    };
    fetchOrder();
  }, [orderId]);

  const customerPhone = orderData?.customer_phone;
  const isVerified = orderData?.customer_id?.user_verified === true;

  // ✅ Logic — isGuest URL param independent
  // showSetPassword: order আছে + user unverified + logged in না + modal success না
  const showSetPassword =
    orderData && !isVerified && !isLoggedIn && !successState;

  // showLoginPrompt: order আছে + user verified + logged in না + modal success না
  const showLoginPrompt =
    orderData && isVerified && !isLoggedIn && !successState;

  const handleModalSuccess = () => {
    setSuccessState(true);
    setModalOpen(false);
    refetchUser(); // ✅ user info refresh
    localStorage.removeItem("unverified_guest_phone");
    sessionStorage.removeItem("banner_dismissed");
  };

  return (
    <Contain>
      <div className="flex flex-col items-center justify-center min-h-[80vh] py-12">
        {/* Success Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center">
            <FaCheckCircle className="text-green-500 text-5xl" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-green-200 animate-ping opacity-20" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800 text-center">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-500 mb-5 text-center max-w-md text-sm">
          Thank you for your purchase. We'll process your order shortly.
        </p>

        {invoiceId && (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mb-7">
            <FiPackage size={15} className="text-gray-400" />
            <span className="text-sm text-gray-500">Invoice ID:</span>
            <span className="text-sm font-bold text-gray-800 font-mono">
              {invoiceId}
            </span>
          </div>
        )}

        {/* ── Unverified guest: Set Password ─────────────────────────── */}
        {showSetPassword && (
          <div className="bg-gradient-to-br from-primary/5 via-white to-primary/5 border border-primary/15 rounded-2xl p-6 mb-7 max-w-sm w-full">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <FiShield size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-gray-800 font-semibold text-sm mb-1">
                  আপনার account তৈরি হয়েছে!
                </p>
                <p className="text-gray-500 text-xs mb-4 leading-relaxed">
                  পাসওয়ার্ড সেট করলে পরবর্তীতে অর্ডার ট্র্যাক করতে ও invoice
                  দেখতে পারবেন।
                </p>
                <button
                  onClick={() => {
                    setModalMode("full");
                    setModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
                >
                  <FiShield size={13} /> Set Password Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Verified but not logged in: Login ──────────────────────── */}
        {showLoginPrompt && (
          <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-100 rounded-2xl p-6 mb-7 max-w-sm w-full">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <FiLogIn size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-800 font-semibold text-sm mb-1">
                  আপনার account আছে!
                </p>
                <p className="text-gray-500 text-xs mb-4 leading-relaxed">
                  Login করুন order track করতে এবং invoice দেখতে।
                </p>
                <button
                  onClick={() => {
                    setModalMode("login");
                    setModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                >
                  <FiLogIn size={13} /> Login Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── After modal success ──────────────────────────────────────── */}
        {successState && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 max-w-sm w-full">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-green-500 text-xl shrink-0" />
              <p className="text-green-800 font-semibold text-sm">
                Logged in successfully! Now you can track your order.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href={`/orders/${orderId}`}>
            <Button className="flex items-center gap-2">
              <FaFileInvoice size={14} /> View Invoice
            </Button>
          </Link>

          {(isLoggedIn || successState) && (
            <Link href="/user-profile?tab=purchase-history">
              <Button variant="outline">View All Orders</Button>
            </Link>
          )}
          <Link href={`/orders/order-tracking/${invoiceId}`}>
            <Button variant="outline" className="flex items-center gap-2">
              <FiTruck size={14} /> Track Order
            </Button>
          </Link>
          <Button
            className="bg-secondary hover:bg-red-500 text-white"
            onClick={() => router.push("/")}
          >
            Go to Home
          </Button>
        </div>
      </div>

      <AccountModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        userPhone={customerPhone}
        userName={orderData?.user_name || orderData?.customer_name}
        orderId={orderId}
        onSuccess={handleModalSuccess}
      />
    </Contain>
  );
};

export default OrderSuccessContent;
