"use client";
import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  FaDownload,
  FaPrint,
  FaShare,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
  FaBoxOpen,
  FaStore,
  FaFileInvoice,
  FaShoppingBag,
  FaCopy,
  FaHistory,
} from "react-icons/fa";
import { FiTruck } from "react-icons/fi";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import useGetSettingData from "@/components/lib/getSettingData";
import CustomLoader from "@/components/shared/loader/CustomLoader";
import { BASE_URL } from "@/components/utils/baseURL";
import { useUserInfoQuery } from "@/redux/feature/auth/authApi";
import { FaCheck } from "react-icons/fa6";

const SITE_URL = "https://artisenleather.com";

const StatusBadge = ({ status }) => {
  const colors = {
    delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
    processing: "bg-blue-100 text-blue-700 border-blue-200",
    shipped: "bg-purple-100 text-purple-700 border-purple-200",
    cancel: "bg-rose-100 text-rose-700 border-rose-200",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[status] || "bg-orange-100 text-orange-700 border-orange-200"}`}
    >
      {status?.toUpperCase()}
    </span>
  );
};

// ── Parse shipping_location → delivery days message ──────────────────────────
const getDeliveryMessage = (shippingLocation) => {
  if (!shippingLocation) return null;
  const lower = shippingLocation.toLowerCase();
  // Extract days from "Outside Dhaka, 5 Days" or "Inside Dhaka, 3 Days"
  const match = shippingLocation.match(/(\d+)\s*[Dd]ays?/);
  const days = match ? match[1] : null;
  if (lower.includes("inside dhaka")) {
    return days
      ? `Delivery within ${days} working days (Inside Dhaka)`
      : "Inside Dhaka delivery";
  }
  if (lower.includes("outside dhaka")) {
    return days
      ? `Delivery within ${days} working days (Outside Dhaka)`
      : "Outside Dhaka delivery";
  }
  return shippingLocation;
};

const OrderInvoice = () => {
  const { orderId } = useParams();
  const router = useRouter();
  const invoiceRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

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

  // ── PDF — multi-page, proper margins, no heading space ───────────────────────
  const downloadPDF = async () => {
    setIsGenerating(true);
    const element = invoiceRef.current;
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
        windowWidth: 800,
        imageTimeout: 0,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageW = pdf.internal.pageSize.getWidth(); // 210mm
      const pageH = pdf.internal.pageSize.getHeight(); // 297mm

      // margins: top of first page = 0 (header starts at top), subsequent pages = 10mm
      const marginTop = 10; // mm — top margin for page 2+
      const marginBottom = 10; // mm — bottom margin for all pages

      const imgW = pageW;
      const imgH = (canvas.height * pageW) / canvas.width; // total img height in mm

      const usableFirstPage = pageH - marginBottom; // first page: no top margin
      const usableOtherPages = pageH - marginTop - marginBottom; // subsequent pages

      let imgPosY = 0; // how far into the image we've printed (mm)
      let isFirstPage = true;

      while (imgPosY < imgH) {
        if (!isFirstPage) pdf.addPage();

        const usable = isFirstPage ? usableFirstPage : usableOtherPages;
        const drawY = isFirstPage ? 0 : marginTop;

        // Clip: draw only the slice of the image for this page
        // jsPDF addImage with sx/sy/sw/sh (source crop in pixels)
        const scaleRatio = canvas.width / pageW; // px per mm
        const sliceHeightPx = usable * scaleRatio;
        const offsetPx = imgPosY * scaleRatio;

        // Create a temporary canvas for this slice
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.min(sliceHeightPx, canvas.height - offsetPx);
        const ctx = sliceCanvas.getContext("2d");
        ctx.drawImage(
          canvas,
          0,
          offsetPx, // source x, y
          canvas.width,
          sliceCanvas.height, // source w, h
          0,
          0, // dest x, y
          canvas.width,
          sliceCanvas.height, // dest w, h
        );

        const sliceData = sliceCanvas.toDataURL("image/png");
        const sliceH = sliceCanvas.height / scaleRatio;
        pdf.addImage(
          sliceData,
          "PNG",
          0,
          drawY,
          imgW,
          sliceH,
          undefined,
          "FAST",
        );

        imgPosY += usable;
        isFirstPage = false;
      }

      pdf.save(`invoice-${order?.invoice_id}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
    setIsGenerating(false);
  };

  // ── Print ─────────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const invoiceHTML = invoiceRef.current.outerHTML;
    printWindow.document.write(`
      <!DOCTYPE html><html><head>
        <title>Invoice ${order?.invoice_id}</title>
        <meta charset="utf-8"/>
        <style>
          *{margin:0;padding:0;box-sizing:border-box;}
          body{font-family:sans-serif;background:#fff;}
          @media print{body{margin:0;}@page{margin:10mm;size:A4;}}
          img{max-width:100%;height:auto;}
          .bg-\\[\\#0D1B2A\\]{background-color:#0D1B2A;}
          .bg-\\[\\#673E39\\]{background-color:#673E39;}
          .bg-\\[\\#E7ECF2\\]{background-color:#E7ECF2;}
          .bg-\\[\\#F0E9E8\\]{background-color:#F0E9E8;}
          .text-\\[\\#234E7C\\]{color:#234E7C;}
          .text-\\[\\#673E39\\]{color:#673E39;}
          .text-\\[\\#0D1B2A\\]{color:#0D1B2A;}
          .text-white{color:#fff;}.text-gray-400{color:#9ca3af;}
          .text-gray-500{color:#6b7280;}.text-gray-600{color:#4b5563;}
          .text-green-600{color:#16a34a;}.text-blue-600{color:#2563eb;}
          .font-bold{font-weight:700;}.font-semibold{font-weight:600;}.font-medium{font-weight:500;}
          .text-xs{font-size:.75rem;}.text-sm{font-size:.875rem;}
          .text-lg{font-size:1.125rem;}.text-xl{font-size:1.25rem;}
          .p-5{padding:1.25rem;}.p-6{padding:1.5rem;}.p-3{padding:.75rem;}
          .px-4{padding-left:1rem;padding-right:1rem;}
          .py-3{padding-top:.75rem;padding-bottom:.75rem;}
          .px-6{padding-left:1.5rem;padding-right:1.5rem;}
          .py-5{padding-top:1.25rem;padding-bottom:1.25rem;}
          .px-3{padding-left:.75rem;padding-right:.75rem;}
          .py-1\\.5{padding-top:.375rem;padding-bottom:.375rem;}
          .mb-3{margin-bottom:.75rem;}.mb-6{margin-bottom:1.5rem;}
          .mt-6{margin-top:1.5rem;}.mt-1{margin-top:.25rem;}
          .mt-2{margin-top:.5rem;}.mb-1{margin-bottom:.25rem;}
          .pt-4{padding-top:1rem;}.pt-6{padding-top:1.5rem;}.pt-2{padding-top:.5rem;}
          .my-2{margin-top:.5rem;margin-bottom:.5rem;}
          .gap-2{gap:.5rem;}.gap-3{gap:.75rem;}.gap-4{gap:1rem;}.gap-6{gap:1.5rem;}
          .flex{display:flex;}.grid{display:grid;}
          .grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr));}
          .items-center{align-items:center;}.justify-between{justify-content:space-between;}
          .justify-center{justify-content:justify-center;}
          .space-y-2>*+*{margin-top:.5rem;}.space-y-1\\.5>*+*{margin-top:.375rem;}
          .border{border:1px solid #e5e7eb;}.border-t{border-top:1px solid #e5e7eb;}
          .border-b{border-bottom:1px solid #e5e7eb;}.border-gray-200{border-color:#e5e7eb;}
          .border-gray-100{border-color:#f3f4f6;}.border-gray-700{border-color:#374151;}
          .rounded{border-radius:.25rem;}.rounded-full{border-radius:9999px;}
          .w-full{width:100%;}.w-10{width:2.5rem;}.h-10{height:2.5rem;}
          .w-12{width:3rem;}.h-12{height:3rem;}.h-1{height:.25rem;}
          .w-20{width:5rem;}.w-72{width:18rem;}
          .max-w-md{max-width:28rem;}.mx-auto{margin-left:auto;margin-right:auto;}
          .ml-auto{margin-left:auto;}
          .text-center{text-align:center;}.text-left{text-align:left;}
          .uppercase{text-transform:uppercase;}.tracking-wider{letter-spacing:.05em;}
          .object-cover{object-fit:cover;}.overflow-x-auto{overflow-x:auto;}
          .divide-y>*+*{border-top:1px solid #e5e7eb;}
          .line-through{text-decoration:line-through;}
          .inline-flex{display:inline-flex;}.leading-relaxed{line-height:1.625;}
          .flex-1{flex:1 1 0%;}.flex-wrap{flex-wrap:wrap;}
          .items-start{align-items:flex-start;}
          .bg-gray-50{background-color:#f9fafb;}.bg-gray-100{background-color:#f3f4f6;}
          .bg-white\\/5{background-color:rgba(255,255,255,.05);}
          .bg-white\\/10{background-color:rgba(255,255,255,.1);}
          .bg-green-50{background-color:#f0fdf4;}.text-green-700{color:#15803d;}
          .border-green-200{border-color:#bbf7d0;}
          table{width:100%;border-collapse:collapse;}
          th,td{padding:.75rem 1rem;text-align:left;}
          thead{background-color:#f9fafb;}
          .hidden{display:none!important;}.sm\\:block{display:block!important;}
          .block{display:block;}.sm\\:hidden{display:none!important;}
          .md\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr));}
          .sm\\:w-72{width:18rem;}.justify-end{justify-content:flex-end;}
        </style>
      </head><body>
        ${invoiceHTML}
        <script>window.onload=function(){setTimeout(function(){window.print();window.close();},400);};</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${order?.invoice_id}`,
          text: `Order Invoice from ${setting?.title}`,
          url: window.location.href,
        });
      } catch {}
    } else {
      setShowShareOptions(!showShareOptions);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareOptions(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-3 sm:px-4 md:px-6 lg:px-8">
      {/* Action Buttons */}
      <div className="sticky top-[100px] z-40 mb-4 flex flex-wrap items-center justify-between gap-2 bg-white/80 backdrop-blur-md p-3 rounded-xl shadow-lg border border-gray-200/50">
        <div className="flex items-center gap-2 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={downloadPDF}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-[#234E7C] hover:bg-[#183C63] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 shadow-sm"
          >
            <FaDownload size={14} />
            <span>{isGenerating ? "Generating..." : "Download PDF"}</span>
          </motion.button>

          {/* <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#673E39] hover:bg-[#53312D] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <FaPrint size={14} />
            <span>Print</span>
          </motion.button> */}

          {/* <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className="flex items-center gap-2 bg-[#E2C8AE] hover:bg-[#D5B08C] text-[#3E2723] px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <FaShare size={14} />
            <span>Share</span>
          </motion.button> */}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              router.push(`/orders/order-tracking/${order?.invoice_id}`)
            }
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <FiTruck size={14} />
            <span>Track Order</span>
          </motion.button>

          {isLoggedIn && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/user-profile?tab=purchase-history")}
              className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm"
            >
              <FaHistory size={14} />
              <span>Order History</span>
            </motion.button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* <StatusBadge status={order?.order_status} /> */}
          <span className="text-xs text-gray-500 hidden sm:inline font-mono bg-gray-100 px-2 py-1 rounded">
            #{order?.invoice_id}
          </span>
        </div>
      </div>

      {/* Share Dropdown */}
      {showShareOptions && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-4 top-[180px] bg-white rounded-xl shadow-xl p-2 z-50 border border-gray-200"
        >
          <button
            onClick={copyLink}
            className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm"
          >
            <FaCopy size={14} className="text-gray-500" /> Copy Link
          </button>
        </motion.div>
      )}

      {/* ── Invoice — PDF target ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        ref={invoiceRef}
        className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200"
        style={{ maxWidth: "800px" }}
      >
        {/* Header */}
        <div className="bg-[#0D1B2A] px-6 py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded">
                <FaFileInvoice className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-white text-xl font-bold tracking-wider">
                  INVOICE
                </h1>
                <p className="text-gray-400 text-xs mt-0.5">
                  #{order?.invoice_id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="bg-white/5 px-3 py-1.5 rounded border border-gray-700">
                <p className="text-gray-400 text-xs">Order Date</p>
                <p className="text-white text-sm font-medium">
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
                className="w-12 h-12 rounded bg-white p-1"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="h-1 w-20 bg-[#673E39] mb-6"></div>

          {/* ── Delivery info banner ────────────────────────────────────────── */}
          {deliveryMessage && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5 mb-5 text-sm">
              <FiTruck size={15} className="text-blue-500 shrink-0" />
              <span className="text-blue-700 font-medium">
                {deliveryMessage}
              </span>
            </div>
          )}

          {/* Customer + Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-[#E7ECF2] rounded">
                  <FaMapMarkerAlt className="text-[#234E7C] text-sm" />
                </div>
                <h3 className="font-semibold text-[#0D1B2A] text-sm uppercase tracking-wider">
                  Billing Address
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-[#0D1B2A]">
                  {order?.customer_id?.user_name}
                </p>
                <p className="text-gray-600 flex items-center gap-2">
                  <FaPhone className="text-gray-400 text-xs" />
                  {order?.customer_phone || order?.customer_id?.user_phone}
                </p>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {order?.billing_address}, {order?.billing_city},{" "}
                  {order?.billing_state}, {order?.billing_country}
                </p>
              </div>
            </div>

            <div className="border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-[#F0E9E8] rounded">
                  <FaShoppingBag className="text-[#673E39] text-sm" />
                </div>
                <h3 className="font-semibold text-[#0D1B2A] text-sm uppercase tracking-wider">
                  Order Info
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium text-[#0D1B2A]">
                    {products?.length} Products
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium text-[#0D1B2A]">
                    {order?.shipping_location}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment:</span>
                  <span className="font-medium text-[#0D1B2A]">
                    {order?.payment_method || "Cash on Delivery"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="mb-6 border border-gray-200">
            <div className="bg-[#E7ECF2] px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-[#0D1B2A] text-sm uppercase tracking-wider flex items-center gap-2">
                <FaBoxOpen className="text-[#234E7C]" /> Order Items
              </h3>
            </div>

            {/* Mobile */}
            <div className="block sm:hidden p-3 space-y-3">
              {products?.map((product, idx) => (
                <div key={idx} className="border border-gray-200 p-3">
                  <div className="flex gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        product?.variation_id
                          ? product?.variation_id?.variation_image
                          : product?.product_id?.main_image
                      }
                      alt={product?.product_id?.product_name}
                      className="w-16 h-16 object-cover border border-gray-200"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/64x64?text=No+Image";
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-[#0D1B2A] text-sm">
                        {product?.product_id?.product_name}
                      </p>
                      {product?.variation_id && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {product?.variation_id?.variation_name}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <span className="text-gray-500">Qty:</span>
                        <span className="text-[#0D1B2A] font-medium">
                          {product?.product_quantity}
                        </span>
                        <span className="text-gray-500">Price:</span>
                        <span className="text-[#0D1B2A] font-medium">
                          ৳{product?.product_unit_final_price}
                        </span>
                        <span className="text-gray-500">Total:</span>
                        <span className="text-[#234E7C] font-bold">
                          ৳{product?.product_grand_total_price}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    {["#", "Product", "Price", "Qty", "Total"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products?.map((product, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              product?.variation_id
                                ? product?.variation_id?.variation_image
                                : product?.product_id?.main_image
                            }
                            alt={product?.product_id?.product_name}
                            className="w-10 h-10 object-cover border border-gray-200"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/40x40?text=No+Image";
                            }}
                          />
                          <div>
                            <p className="font-medium text-[#0D1B2A]">
                              {product?.product_id?.product_name}
                            </p>
                            {product?.variation_id && (
                              <p className="text-xs text-gray-500">
                                {product?.variation_id?.variation_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {product?.product_unit_price >
                        product?.product_unit_final_price ? (
                          <div className="flex items-center gap-1">
                            <span className="line-through text-gray-400 text-xs">
                              ৳{product?.product_unit_price}
                            </span>
                            <span className="font-medium text-[#234E7C]">
                              ৳{product?.product_unit_final_price}
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium">
                            ৳{product?.product_unit_price}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {product?.product_quantity}
                      </td>
                      <td className="px-4 py-3 font-medium text-[#234E7C]">
                        ৳{product?.product_grand_total_price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Price Summary */}
          <div className="flex justify-end mb-6">
            <div className="w-full sm:w-72 border border-gray-200 p-5">
              <h4 className="font-semibold text-[#0D1B2A] text-sm uppercase tracking-wider mb-3 pb-2 border-b border-gray-200">
                Price Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-[#0D1B2A]">
                    ৳{subtotal}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium text-[#0D1B2A]">
                    ৳{order?.shipping_cost}
                  </span>
                </div>
                {order?.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>- ৳{order?.discount_amount}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 my-2 pt-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-[#0D1B2A]">Grand Total:</span>
                    <span className="text-[#234E7C] text-lg">
                      ৳{order?.grand_total_amount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="text-center mb-6">
              {/* ✅ Pure SVG — works in PDF & print */}
              <div className="flex items-center justify-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F0E9E8]">
                  <img src="/check.png" alt="" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-1">
                Thank You for Your Order!
              </h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                We appreciate your business and hope you enjoy your purchase.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-[#0D1B2A] text-sm uppercase tracking-wider flex items-center gap-2">
                  <FaStore className="text-[#234E7C]" /> Store Information
                </h4>
                <div className="space-y-1.5 text-sm">
                  <p className="flex items-center gap-2 text-gray-600">
                    <FaPhone className="text-gray-400" size={12} />{" "}
                    {setting?.contact}
                  </p>
                  <p className="flex items-center gap-2 text-gray-600">
                    <FaEnvelope className="text-gray-400" size={12} />{" "}
                    {setting?.email}
                  </p>
                  <p className="flex items-center gap-2 text-gray-600">
                    <FaGlobe className="text-gray-400" size={12} />{" "}
                    {setting?.address}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-[#0D1B2A] text-sm uppercase tracking-wider">
                  Follow Us
                </h4>
                <div className="flex flex-wrap gap-2">
                  {setting?.facebook && (
                    <a
                      href={setting.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-[#E7ECF2] text-[#234E7C] rounded hover:bg-[#C3CFDD] transition-colors"
                    >
                      <FaFacebook size={16} />
                    </a>
                  )}
                  {setting?.instagram && (
                    <a
                      href={setting.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-[#F0E9E8] text-[#673E39] rounded hover:bg-[#D7C3C0] transition-colors"
                    >
                      <FaInstagram size={16} />
                    </a>
                  )}
                  {setting?.watsapp && (
                    <a
                      href={setting.watsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      <FaWhatsapp size={16} />
                    </a>
                  )}
                  {setting?.you_tube && (
                    <a
                      href={setting.you_tube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      <FaYoutube size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">
                © {new Date().getFullYear()} {setting?.title}. All rights
                reserved.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                This is a computer generated invoice, no signature required.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderInvoice;
