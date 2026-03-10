"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaFileInvoice } from "react-icons/fa";
import {
  FiPackage,
  FiTruck,
  FiShield,
  FiLogIn,
  FiArrowRight,
} from "react-icons/fi";
import Contain from "../common/Contain";
import { BASE_URL } from "@/components/utils/baseURL";
import { useUserInfoQuery } from "@/redux/feature/auth/authApi";
import AccountModal from "../frontend/auth/accountModal/AccountModal";

const OrderSuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const isGuest = searchParams.get("guest") === "true";

  const { data: userInfo } = useUserInfoQuery();
  const isLoggedIn = !!userInfo?.data?._id;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("full"); // "full" | "login"
  const [orderData, setOrderData] = useState(null);
  const [successState, setSuccessState] = useState(false); // logged in after modal

  useEffect(() => {
    if (!orderId || !isGuest) return;
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${BASE_URL}/order/${orderId}`);
        const data = await res.json();
        if (data?.success && data?.data?.order) {
          const order = data.data.order;
          setOrderData(order);

          const verified = order?.customer_id?.user_verified;
          const phone = order?.customer_phone;

          if (!verified && phone) {
            // Unverified guest — save to localStorage for banner
            localStorage.setItem("unverified_guest_phone", phone);
          }
        }
      } catch {}
    };
    fetchOrder();
  }, [orderId, isGuest]);

  const isVerified = orderData?.customer_id?.user_verified === true;
  const customerPhone = orderData?.customer_phone;

  // Which prompt to show
  // 1. Not guest → nothing
  // 2. Guest + logged in already → nothing
  // 3. Guest + verified + not logged in → login modal
  // 4. Guest + unverified → set password modal (full)
  const showLoginPrompt = isGuest && !isLoggedIn && isVerified && !successState;
  const showSetPasswordPrompt =
    isGuest && !isLoggedIn && !isVerified && !successState && orderData;

  const handleModalSuccess = () => {
    setSuccessState(true);
    setModalOpen(false);
    // Clear unverified flag
    localStorage.removeItem("unverified_guest_phone");
    sessionStorage.removeItem("banner_dismissed");
  };

  return (
    <Contain>
      <div className="flex flex-col items-center justify-center min-h-[80vh] py-12">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <FaCheckCircle className="text-green-500 text-5xl" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800 text-center">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-500 mb-4 text-center max-w-md text-sm">
          Thank you for your purchase. We'll process your order shortly.
        </p>

        {orderId && (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mb-6">
            <FiPackage size={15} className="text-gray-400" />
            <span className="text-sm text-gray-500">Order ID:</span>
            <span className="text-sm font-bold text-gray-800">{orderId}</span>
          </div>
        )}

        {/* ── Case 4: Unverified guest → Set Password prompt ─────────── */}
        {showSetPasswordPrompt && (
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-5 mb-6 max-w-sm w-full text-center">
            <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiShield size={20} className="text-primary" />
            </div>
            <p className="text-gray-800 font-semibold mb-1 text-sm">
              আপনার account তৈরি হয়েছে!
            </p>
            <p className="text-gray-500 text-xs mb-4">
              পাসওয়ার্ড সেট করলে পরবর্তীতে অর্ডার ট্র্যাক ও ইতিহাস দেখতে
              পারবেন।
            </p>
            <button
              onClick={() => {
                setModalMode("full");
                setModalOpen(true);
              }}
              className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all"
            >
              <FiShield size={15} /> Set Password
            </button>
          </div>
        )}

        {/* ── Case 3: Verified but not logged in → Login prompt ──────── */}
        {showLoginPrompt && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 mb-6 max-w-sm w-full text-center">
            <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiLogIn size={20} className="text-blue-600" />
            </div>
            <p className="text-gray-800 font-semibold mb-1 text-sm">
              আপনার account আছে!
            </p>
            <p className="text-gray-500 text-xs mb-4">
              Login করুন order track করতে এবং invoice দেখতে।
            </p>
            <button
              onClick={() => {
                setModalMode("login");
                setModalOpen(true);
              }}
              className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all"
            >
              <FiLogIn size={15} /> Login Now
            </button>
          </div>
        )}

        {/* ── Success after modal ─────────────────────────────────────── */}
        {successState && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 max-w-sm w-full text-center">
            <FaCheckCircle className="text-green-500 text-xl mx-auto mb-2" />
            <p className="text-green-800 font-semibold text-sm">
              Logged in successfully!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          {orderId && (isLoggedIn || successState) && (
            <Link
              href={`/user-profile?tab=purchase-history&order_id=${orderId}`}
            >
              <Button className="flex items-center gap-2">
                <FaFileInvoice size={14} /> View Invoice
              </Button>
            </Link>
          )}
          {(isLoggedIn || successState) && (
            <Link href="/user-profile?tab=purchase-history">
              <Button variant="outline" className="flex items-center gap-2">
                View All Orders
              </Button>
            </Link>
          )}
          <Link href="/orders/order-tracking">
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

      {/* Account Modal */}
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
