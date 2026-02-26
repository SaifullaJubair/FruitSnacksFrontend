"use client";

import { Suspense } from "react";
import Contain from "@/components/common/Contain";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FaCheckCircle, FaFileInvoice } from "react-icons/fa";
import { MdLockReset } from "react-icons/md";

const OrderSuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const isGuest = searchParams.get("guest") === "true";

  return (
    <Contain>
      <div className="flex flex-col items-center justify-center min-h-[80vh] py-12">
        <FaCheckCircle className="text-green-500 text-6xl mb-4" />
        <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
        <p className="text-lg text-gray-700 mb-2">
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        {orderId && (
          <p className="text-sm text-gray-500 mb-4">
            Order ID:{" "}
            <span className="font-medium text-gray-700">{orderId}</span>
          </p>
        )}

        {/* Guest user — password set করার prompt */}
        {isGuest && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6 max-w-md text-center">
            <p className="text-blue-800 font-medium mb-1">
              আপনার অ্যাকাউন্ট তৈরি হয়েছে!
            </p>
            <p className="text-blue-600 text-sm mb-3">
              আপনার দেওয়া মোবাইল নম্বর দিয়ে একটি অ্যাকাউন্ট তৈরি হয়েছে।
              পাসওয়ার্ড সেট করলে পরবর্তীতে অর্ডার ট্র্যাক করতে পারবেন।
            </p>
            <Link href="/forget-password">
              <Button className="flex items-center gap-2 mx-auto" size="sm">
                <MdLockReset size={16} />
                Set Password
              </Button>
            </Link>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          {orderId && (
            <Link
              href={`/user-profile?tab=purchase-history&order_id=${orderId}`}
            >
              <Button className="flex items-center gap-2">
                <FaFileInvoice />
                View Invoice
              </Button>
            </Link>
          )}
          <Link href="/user-profile?tab=purchase-history">
            <Button variant="outline">View All Orders</Button>
          </Link>
          <Button
            className="bg-secondary hover:bg-red-500 text-white"
            onClick={() => router.push("/")}
          >
            Go to Home
          </Button>
        </div>
      </div>
    </Contain>
  );
};

const OrderSuccessPage = () => {
  return (
    <Suspense
      fallback={
        <Contain>
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </Contain>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
};

export default OrderSuccessPage;
