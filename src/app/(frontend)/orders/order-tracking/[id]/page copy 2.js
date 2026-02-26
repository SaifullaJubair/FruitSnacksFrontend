"use client";
// /orders/order-tracking/[id]/page.jsx

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BASE_URL } from "@/components/utils/baseURL";
import { FaTruck, FaBoxOpen, FaCheckCircle, FaBan } from "react-icons/fa";
import { MdOutlineInventory2 } from "react-icons/md";
import { FiExternalLink } from "react-icons/fi";

// ── Steadfast status config ───────────────────────────────────
const STEADFAST_STATUS_LABEL = {
  in_review: "In Review",
  pending: "Pickup Pending",
  hold: "On Hold",
  delivered: "Delivered",
  partial_delivered: "Partially Delivered",
  cancelled: "Cancelled",
  delivered_approval_pending: "Delivery Pending",
  partial_delivered_approval_pending: "Partial Delivery Pending",
  cancelled_approval_pending: "Cancellation Pending",
  unknown_approval_pending: "Unknown — Pending",
  unknown: "Unknown",
};
const STEADFAST_STATUS_COLOR = {
  delivered: "bg-emerald-100 text-emerald-700",
  partial_delivered: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  in_review: "bg-blue-100 text-blue-700",
  pending: "bg-orange-100 text-orange-700",
  hold: "bg-purple-100 text-purple-700",
  unknown: "bg-gray-100 text-gray-500",
};

// ── Pathao status config ──────────────────────────────────────
const PATHAO_STATUS_COLOR = {
  Delivered: "bg-emerald-100 text-emerald-700",
  "Partial Delivery": "bg-amber-100 text-amber-700",
  Cancelled: "bg-red-100 text-red-700",
  "In Transit": "bg-purple-100 text-purple-700",
  "Out for Delivery": "bg-orange-100 text-orange-700",
  Return: "bg-red-50 text-red-500",
  "Delivery Failed": "bg-red-50 text-red-500",
  "On Hold": "bg-purple-50 text-purple-500",
  "Pickup Requested": "bg-blue-100 text-blue-700",
};

// ── Stepper ───────────────────────────────────────────────────
const STEPS = [
  {
    key: "pending",
    label: "Order Placed",
    timeKey: "pending_time",
    Icon: FaBoxOpen,
  },
  {
    key: "processing",
    label: "Processing",
    timeKey: "processing_time",
    Icon: MdOutlineInventory2,
  },
  {
    key: "shipped",
    label: "On the Way",
    timeKey: "shipped_time",
    Icon: FaTruck,
  },
  {
    key: "delivered",
    label: "Delivered",
    timeKey: "delivered_time",
    Icon: FaCheckCircle,
  },
];

const getActiveIdx = (order) => {
  if (!order) return 0;
  const idx = STEPS.findIndex((s) => s.key === order.order_status);
  return idx === -1 ? 0 : idx;
};

const OrderStepper = ({ order }) => {
  const isCancelled =
    order?.order_status === "cancel" || order?.order_status === "return";
  const activeIdx = getActiveIdx(order);

  if (isCancelled) {
    return (
      <div className="flex flex-col items-center py-10 gap-3">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <FaBan size={26} className="text-red-500" />
        </div>
        <p className="font-semibold text-red-600 text-lg">Order Cancelled</p>
        {order?.cancel_time && (
          <p className="text-xs text-gray-400">{order.cancel_time}</p>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden sm:flex items-start justify-between relative px-6 pt-8 pb-6">
        <div className="absolute top-[2.6rem] left-10 right-10 h-0.5 bg-gray-200 z-0">
          <div
            className="h-full bg-primary transition-all duration-700"
            style={{ width: `${(activeIdx / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
        {STEPS.map(({ key, label, timeKey, Icon }, idx) => {
          const done = idx <= activeIdx;
          return (
            <div
              key={key}
              className="relative z-10 flex flex-col items-center flex-1 gap-2"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all ${done ? "bg-primary border-primary text-white shadow-lg" : "bg-white border-gray-200 text-gray-300"}`}
              >
                <Icon size={17} />
              </div>
              <p
                className={`text-xs font-semibold text-center ${done ? "text-primary" : "text-gray-400"}`}
              >
                {label}
              </p>
              {order?.[timeKey] && (
                <p className="text-[10px] text-gray-400 text-center">
                  {order[timeKey]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="flex sm:hidden flex-col px-5 py-6">
        {STEPS.map(({ key, label, timeKey, Icon }, idx) => {
          const done = idx <= activeIdx;
          const isLast = idx === STEPS.length - 1;
          return (
            <div key={key} className="flex gap-4 items-start">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${done ? "bg-primary border-primary text-white shadow" : "bg-white border-gray-200 text-gray-300"}`}
                >
                  <Icon size={14} />
                </div>
                {!isLast && (
                  <div
                    className={`w-0.5 min-h-[32px] flex-1 mt-1 ${done ? "bg-primary" : "bg-gray-200"}`}
                  />
                )}
              </div>
              <div className="pb-6 pt-1">
                <p
                  className={`text-sm font-semibold ${done ? "text-primary" : "text-gray-400"}`}
                >
                  {label}
                </p>
                {order?.[timeKey] && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {order[timeKey]}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ── Main Page ─────────────────────────────────────────────────
const DashboardOrderTrack = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BASE_URL}/order/order_tracking`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: id }),
      });
      const result = await res.json();
      if (!result?.success || !result?.data) {
        setError("Order not found. Please check your Invoice ID.");
        return;
      }
      setOrder(result.data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Fetching your order...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <FaTruck size={26} className="text-red-300" />
        </div>
        <p className="text-gray-700 font-semibold">{error}</p>
        <p className="text-xs text-gray-400">Invoice: {id}</p>
        <button
          onClick={fetchOrder}
          className="mt-2 px-6 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const orderInfo = order?.order_info;
  const orderProducts = order?.order_products;
  const isSteadfast = orderInfo?.courier_type === "steadfast";
  const isPathao = orderInfo?.courier_type === "pathao";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Order Tracking</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Invoice:{" "}
            <span className="font-mono font-semibold text-gray-600">
              {orderInfo?.invoice_id}
            </span>
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
            orderInfo?.order_status === "delivered"
              ? "bg-emerald-100 text-emerald-700"
              : orderInfo?.order_status === "cancel"
                ? "bg-red-100 text-red-700"
                : orderInfo?.order_status === "shipped"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
          }`}
        >
          {orderInfo?.order_status}
        </span>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <OrderStepper order={orderInfo} />
      </div>

      {/* Steadfast Tracking Card */}
      {isSteadfast && orderInfo?.steadfast_consignment_id && (
        <div className="bg-white rounded-2xl shadow-sm border-l-4 border-orange-400 p-5">
          <div className="flex items-center gap-2 mb-3">
            <FaTruck className="text-orange-500" size={15} />
            <h3 className="font-semibold text-gray-700 text-sm">
              Steadfast Tracking
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Courier Status</p>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${STEADFAST_STATUS_COLOR[orderInfo?.steadfast_status] || "bg-gray-100 text-gray-500"}`}
              >
                {STEADFAST_STATUS_LABEL[orderInfo?.steadfast_status] ||
                  orderInfo?.steadfast_status ||
                  "-"}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Tracking Code</p>
              <p className="font-mono font-semibold text-gray-700 text-sm">
                {orderInfo?.steadfast_tracking_code || "-"}
              </p>
            </div>
          </div>
          {orderInfo?.steadfast_tracking_code && (
            <a
              href={`https://steadfast.com.bd/t/${orderInfo?.steadfast_tracking_code}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              Track on Steadfast <FiExternalLink size={10} />
            </a>
          )}
          {orderInfo?.steadfast_tracking_message && (
            <div className="mt-3 bg-orange-50 rounded-lg p-3 text-xs text-gray-600">
              <span className="font-semibold">Latest: </span>
              {orderInfo.steadfast_tracking_message}
            </div>
          )}
        </div>
      )}

      {/* Pathao Tracking Card */}
      {isPathao && orderInfo?.consignment_id && (
        <div className="bg-white rounded-2xl shadow-sm border-l-4 border-blue-400 p-5">
          <div className="flex items-center gap-2 mb-3">
            <FaTruck className="text-blue-500" size={15} />
            <h3 className="font-semibold text-gray-700 text-sm">
              Pathao Tracking
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Courier Status</p>
              {orderInfo?.pathao_status ? (
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${PATHAO_STATUS_COLOR[orderInfo?.pathao_status] || "bg-gray-100 text-gray-500"}`}
                >
                  {orderInfo?.pathao_status}
                </span>
              ) : (
                <span className="text-xs text-gray-400">Pending update</span>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Tracking Code</p>
              <p className="font-mono font-semibold text-gray-700 text-sm">
                {orderInfo?.tracking_code || "-"}
              </p>
            </div>
          </div>
          {orderInfo?.tracking_code && (
            <a
              href={`https://merchant.pathao.com/tracking?consignment_id=${orderInfo?.consignment_id}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              Track on Pathao <FiExternalLink size={10} />
            </a>
          )}
        </div>
      )}

      {/* Products */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b">
          <h3 className="text-sm font-semibold text-gray-700">
            Items ({orderProducts?.length})
          </h3>
        </div>
        <div className="divide-y">
          {orderProducts?.map((product, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
              <div className="w-14 h-14 rounded-lg border bg-gray-50 overflow-hidden flex-shrink-0">
                <img
                  src={
                    product?.variation_id?.variation_image ||
                    product?.product_id?.main_image
                  }
                  alt={product?.product_id?.product_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 leading-snug truncate">
                  {product?.product_id?.product_name}
                </p>
                {product?.variation_id && (
                  <p className="text-xs text-gray-400">
                    {product?.variation_id?.variation_name}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-0.5">
                  {product?.product_quantity} × ৳
                  {product?.product_unit_final_price}
                </p>
              </div>
              <p className="text-sm font-bold text-gray-800 whitespace-nowrap">
                ৳{product?.product_quantity * product?.product_unit_final_price}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-2 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span>
          <span>৳{orderInfo?.sub_total_amount}</span>
        </div>
        {orderInfo?.discount_amount > 0 && (
          <div className="flex justify-between text-gray-500">
            <span>Discount</span>
            <span className="text-emerald-600">
              - ৳{orderInfo?.discount_amount}
            </span>
          </div>
        )}
        {orderInfo?.shipping_cost > 0 && (
          <div className="flex justify-between text-gray-500">
            <span>Shipping</span>
            <span>৳{orderInfo?.shipping_cost}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-gray-900 text-base border-t pt-2">
          <span>Grand Total</span>
          <span>৳{orderInfo?.grand_total_amount}</span>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Delivery Address
        </h3>
        <p className="text-sm text-gray-600">
          {orderInfo?.billing_address}, {orderInfo?.billing_city},{" "}
          {orderInfo?.billing_state}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Phone: {orderInfo?.customer_phone}
        </p>
      </div>
    </div>
  );
};

export default DashboardOrderTrack;
