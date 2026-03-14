"use client";
import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toCanvas } from "html-to-image";
import jsPDF from "jspdf";
import {
  FaDownload,
  FaHistory,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaStore,
  FaFileInvoice,
  FaShoppingBag,
  FaBoxOpen,
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
  FaCheckCircle,
} from "react-icons/fa";
import { FiTruck } from "react-icons/fi";
import useGetSettingData from "@/components/lib/getSettingData";
import CustomLoader from "@/components/shared/loader/CustomLoader";
import { BASE_URL } from "@/components/utils/baseURL";
import { useUserInfoQuery } from "@/redux/feature/auth/authApi";

const getDeliveryMessage = (loc) => {
  if (!loc) return null;
  const lower = loc.toLowerCase();
  const match = loc.match(/(\d+)\s*[Dd]ays?/);
  const days = match ? match[1] : null;
  if (lower.includes("inside dhaka"))
    return days
      ? `Delivery within ${days} working days (Inside Dhaka)`
      : "Inside Dhaka delivery";
  if (lower.includes("outside dhaka"))
    return days
      ? `Delivery within ${days} working days (Outside Dhaka)`
      : "Outside Dhaka delivery";
  return loc;
};

const STATUS_STYLES = {
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  shipped: "bg-purple-100 text-purple-700 border-purple-200",
  cancel: "bg-rose-100 text-rose-700 border-rose-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
};

const StatusBadge = ({ status }) => (
  <span
    className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}
  >
    {status?.toUpperCase()}
  </span>
);

const OrderInvoice = () => {
  const { orderId } = useParams();
  const router = useRouter();
  const invoiceRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: settingData, isLoading: settingDataLoading } =
    useGetSettingData();
  const { data: userInfo } = useUserInfoQuery();
  const isLoggedIn = !!userInfo?.data?._id;

  const { data: orders, isLoading } = useQuery({
    queryKey: [`/api/v1/order/${orderId}`],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/order/${orderId}`, {
        credentials: "include",
      });
      return res.json();
    },
  });

  if (isLoading || settingDataLoading) return <CustomLoader />;

  const order = orders?.data?.order;
  const products = orders?.data?.order_products;
  const setting = settingData?.data[0];
  const subtotal = products?.reduce(
    (acc, p) => acc + p.product_grand_total_price,
    0,
  );
  const deliveryMessage = getDeliveryMessage(order?.shipping_location);

  // ── html-to-image + jsPDF ─────────────────────────────────────────────────
  const downloadPDF = async () => {
    setIsGenerating(true);
    try {
      const canvas = await toCanvas(invoiceRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (canvas.height * pageW) / canvas.width;

      if (imgH <= pageH) {
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          0,
          0,
          imgW,
          imgH,
          undefined,
          "FAST",
        );
      } else {
        const scale = pageH / imgH;
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          0,
          0,
          imgW * scale,
          pageH,
          undefined,
          "FAST",
        );
      }

      pdf.save(`invoice-${order?.invoice_id}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 py-6 px-3 sm:px-4 md:px-6 lg:px-8">
      {/* Action Bar */}
      <div className="sticky top-[100px] z-40 mb-6 max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-gray-200/60">
          <div className="flex items-center gap-2 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={downloadPDF}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-[#234E7C] hover:bg-[#1a3d61] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 shadow-sm"
            >
              <FaDownload size={13} />
              <span>{isGenerating ? "Generating..." : "Download PDF"}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                router.push(`/orders/order-tracking/${order?.invoice_id}`)
              }
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            >
              <FiTruck size={14} />
              <span>Track Order</span>
            </motion.button>

            {isLoggedIn && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  router.push("/user-profile?tab=purchase-history")
                }
                className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              >
                <FaHistory size={13} />
                <span>Order History</span>
              </motion.button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order?.order_status} />
            <span className="text-xs text-gray-400 hidden sm:inline font-mono bg-gray-100 px-2.5 py-1 rounded-lg">
              #{order?.invoice_id}
            </span>
          </div>
        </div>
      </div>

      {/* ── Invoice — PDF target ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto"
      >
        <div
          ref={invoiceRef}
          className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-xl"
        >
          {/* Header */}
          <div className="bg-[#0D1B2A] px-7 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2.5 rounded-lg">
                  <FaFileInvoice className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-white text-2xl font-bold tracking-widest">
                    INVOICE
                  </h1>
                  <p className="text-slate-400 text-xs mt-0.5 font-mono">
                    #{order?.invoice_id}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                  <p className="text-slate-400 text-xs">Order Date</p>
                  <p className="text-white text-sm font-bold mt-0.5">
                    {new Date(order?.pending_time).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={setting?.logo}
                  alt={setting?.title}
                  crossOrigin="anonymous"
                  className="w-12 h-12 rounded-lg bg-white p-1 object-contain"
                />
              </div>
            </div>
          </div>

          {/* Accent */}
          <div className="h-0.5 bg-gradient-to-r from-[#234E7C] via-[#3a6fa8] to-[#234E7C]" />

          <div className="p-7">
            {/* Delivery Banner */}
            {deliveryMessage && (
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-5 text-sm">
                <FiTruck className="text-blue-500 shrink-0" size={16} />
                <span className="text-blue-700 font-semibold">
                  {deliveryMessage}
                </span>
              </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              {/* Billing */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/60">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-[#E7ECF2] rounded-lg">
                    <FaMapMarkerAlt className="text-[#234E7C]" size={12} />
                  </div>
                  <span className="text-xs font-bold text-[#234E7C] uppercase tracking-wider">
                    Billing Address
                  </span>
                </div>
                <p className="font-bold text-[#0D1B2A] text-sm mb-1">
                  {order?.customer_id?.user_name}
                </p>
                <p className="text-gray-500 text-xs flex items-center gap-1.5 mb-1">
                  <FaPhone size={10} className="text-gray-400" />
                  {order?.customer_phone || order?.customer_id?.user_phone}
                </p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {order?.billing_address}, {order?.billing_city},{" "}
                  {order?.billing_state}, {order?.billing_country}
                </p>
              </div>

              {/* Order Info */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/60">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-[#F0E9E8] rounded-lg">
                    <FaShoppingBag className="text-[#673E39]" size={12} />
                  </div>
                  <span className="text-xs font-bold text-[#673E39] uppercase tracking-wider">
                    Order Info
                  </span>
                </div>
                {[
                  { k: "Items", v: `${products?.length} Products` },
                  { k: "Shipping", v: order?.shipping_location },
                  {
                    k: "Payment",
                    v: order?.payment_method || "Cash on Delivery",
                  },
                ].map(({ k, v }) => (
                  <div key={k} className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-500">{k}:</span>
                    <span className="font-bold text-[#0D1B2A]">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Products Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-5">
              <div className="bg-[#EEF2F7] px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                <FaBoxOpen className="text-[#234E7C]" size={13} />
                <span className="text-xs font-bold text-[#234E7C] uppercase tracking-wider">
                  Order Items
                </span>
              </div>
              {/* Col headers */}
              <div className="flex bg-gray-50 px-4 py-2 border-b border-gray-100">
                {[
                  { label: "#", w: "w-7" },
                  { label: "Product", cls: "flex-1" },
                  { label: "Price", w: "w-20", align: "text-right" },
                  { label: "Qty", w: "w-10", align: "text-center" },
                  { label: "Total", w: "w-20", align: "text-right" },
                ].map(({ label, w, cls, align }) => (
                  <div
                    key={label}
                    className={`${w || ""} ${cls || ""} ${align || ""} text-[9px] font-bold text-gray-400 uppercase tracking-wider`}
                  >
                    {label}
                  </div>
                ))}
              </div>
              {/* Rows */}
              {products?.map((product, idx) => (
                <div
                  key={idx}
                  className={`flex items-center px-4 py-3 ${idx !== products.length - 1 ? "border-b border-gray-100" : ""} ${idx % 2 !== 0 ? "bg-gray-50/50" : ""}`}
                >
                  <div className="w-7 text-xs text-gray-400">{idx + 1}</div>
                  <div className="flex-1 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        product?.variation_id?.variation_image ||
                        product?.product_id?.main_image
                      }
                      alt={product?.product_id?.product_name}
                      crossOrigin="anonymous"
                      className="w-9 h-9 rounded-lg object-cover border border-gray-200 shrink-0"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <div>
                      <p className="font-bold text-xs text-[#0D1B2A]">
                        {product?.product_id?.product_name}
                      </p>
                      {product?.variation_id && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {product?.variation_id?.variation_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="w-20 text-right">
                    {product?.product_unit_price >
                    product?.product_unit_final_price ? (
                      <>
                        <p className="text-[10px] text-gray-400 line-through">
                          ৳{product?.product_unit_price}
                        </p>
                        <p className="text-xs font-bold text-[#234E7C]">
                          ৳{product?.product_unit_final_price}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs font-bold text-[#0D1B2A]">
                        ৳{product?.product_unit_price}
                      </p>
                    )}
                  </div>
                  <div className="w-10 text-center text-xs text-gray-600">
                    {product?.product_quantity}
                  </div>
                  <div className="w-20 text-right text-sm font-bold text-[#234E7C]">
                    ৳{product?.product_grand_total_price}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Summary */}
            <div className="flex justify-end mb-6">
              <div className="w-64 border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-[#EEF2F7] px-4 py-2.5 border-b border-gray-200 text-[9px] font-bold text-[#234E7C] uppercase tracking-wider">
                  Price Summary
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Subtotal:</span>
                    <span className="font-bold text-[#0D1B2A]">
                      ৳{subtotal}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Shipping:</span>
                    <span className="font-bold text-[#0D1B2A]">
                      ৳{order?.shipping_cost}
                    </span>
                  </div>
                  {order?.discount_amount > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600">
                      <span>Discount:</span>
                      <span className="font-bold">
                        - ৳{order?.discount_amount}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                    <span className="font-bold text-sm text-[#0D1B2A]">
                      Grand Total:
                    </span>
                    <span className="font-black text-xl text-[#234E7C]">
                      ৳{order?.grand_total_amount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-7 py-5">
            {/* Thank you */}
            <div className="text-center mb-5">
              <div className="flex justify-center mb-2">
                <FaCheckCircle className="text-emerald-500 text-4xl" />
              </div>
              <h3 className="font-bold text-[#0D1B2A] text-base mb-1">
                Thank You for Your Order!
              </h3>
              <p className="text-xs text-gray-500">
                We appreciate your business and hope you enjoy your purchase.
              </p>
            </div>

            {/* Store info + social */}
            <div className="flex justify-between gap-6 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FaStore className="text-[#234E7C]" size={12} />
                  <span className="text-[9px] font-bold text-[#0D1B2A] uppercase tracking-wider">
                    Store Information
                  </span>
                </div>
                <div className="space-y-1 text-xs text-gray-500">
                  <p className="flex items-center gap-1.5">
                    <FaPhone size={10} className="text-gray-400" />{" "}
                    {setting?.contact}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <FaEnvelope size={10} className="text-gray-400" />{" "}
                    {setting?.email}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <FaGlobe size={10} className="text-gray-400" />{" "}
                    {setting?.address}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[9px] font-bold text-[#0D1B2A] uppercase tracking-wider mb-2">
                  Follow Us
                </p>
                <div className="flex gap-2">
                  {setting?.facebook && (
                    <a
                      href={setting.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-[#DBEAFE] text-[#1D4ED8] rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
                    >
                      <FaFacebook size={15} />
                    </a>
                  )}
                  {setting?.instagram && (
                    <a
                      href={setting.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-[#FCE7F3] text-[#9D174D] rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
                    >
                      <FaInstagram size={15} />
                    </a>
                  )}
                  {setting?.watsapp && (
                    <a
                      href={setting.watsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-[#D1FAE5] text-[#16A34A] rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
                    >
                      <FaWhatsapp size={15} />
                    </a>
                  )}
                  {setting?.you_tube && (
                    <a
                      href={setting.you_tube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-[#FEE2E2] text-[#DC2626] rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
                    >
                      <FaYoutube size={15} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="text-[10px] text-gray-400">
                © {new Date().getFullYear()} {setting?.title}. All rights
                reserved.
              </span>
              <span className="text-[10px] text-gray-400 italic">
                Computer generated invoice — no signature required.
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderInvoice;
