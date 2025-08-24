"use client";

import Contain from "@/components/common/Contain";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaCheckCircle } from "react-icons/fa";

const OrderSuccessPage = () => {
  const router = useRouter();

  // const handleViewOrders = () => {
  //   router.push("/orders");
  // };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <Contain>
      <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 ">
        <FaCheckCircle className="text-green-500 text-6xl mb-4" />
        <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
        <p className="text-lg text-gray-700 mb-6">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
        <p className="text-lg text-gray-700 mb-6">
          Note: You can see the invoice in orders table.
        </p>
        <div className="flex space-x-4">
          <Link href="/user-profile?tab=purchase-history">
            {" "}
            <Button>View Orders</Button>
          </Link>
          <Button
            className="bg-secondary hover:bg-red-500 text-white"
            onClick={handleGoHome}
          >
            Go to Home
          </Button>
        </div>
      </div>
    </Contain>
  );
};

export default OrderSuccessPage;
