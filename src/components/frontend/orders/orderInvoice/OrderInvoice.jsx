"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  FaDownload,
  FaPrint,
  FaShare,
  FaCheckCircle,
  FaTruck,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
  FaTiktok,
  FaTwitter,
  FaRupeeSign,
  FaBoxOpen,
  FaClock,
  FaTag,
  FaShippingFast,
  FaStore,
  FaCalendarAlt,
  FaUser,
  FaFileInvoice,
  FaShoppingBag,
  FaMoneyBillWave,
  FaCopy,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { FiDownload, FiPrinter, FiShare2 } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import useGetSettingData from "@/components/lib/getSettingData";
import CustomLoader from "@/components/shared/loader/CustomLoader";
import { BASE_URL } from "@/components/utils/baseURL";
import { EnglishDateWithTimeShort } from "@/components/utils/EnglishDateWithTimeShort";

const OrderInvoice = () => {
  const { orderId } = useParams();
  const invoiceRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const { data: settingData, isLoading: settingDataLoading } =
    useGetSettingData();

  const { data: orders, isLoading } = useQuery({
    queryKey: [`/api/v1/order/${orderId}`],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/order/${orderId}`, {
        credentials: "include",
      });
      const data = await res.json();
      return data;
    },
  });

  if (isLoading || settingDataLoading) {
    return <CustomLoader />;
  }

  const order = orders?.data?.order;
  const products = orders?.data?.order_products;
  const setting = settingData?.data[0];

  // Calculate totals
  const subtotal = products?.reduce(
    (acc, p) => acc + p.product_grand_total_price,
    0,
  );

  // Download PDF function with fixed size
  const downloadPDF = async () => {
    setIsGenerating(true);
    const element = invoiceRef.current;

    try {
      // Clone the element to avoid modifying original
      const clone = element.cloneNode(true);
      clone.style.width = "800px";
      clone.style.padding = "20px";
      clone.style.backgroundColor = "#ffffff";

      // Append to body temporarily
      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.top = "0";
      tempDiv.style.width = "800px";
      tempDiv.appendChild(clone);
      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 800,
        allowTaint: true,
        useCORS: true,
      });

      // Remove temporary element
      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL("image/png");

      // Calculate PDF dimensions (A4 size proportions)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pdfWidth,
        pdfHeight,
        undefined,
        "FAST",
      );
      pdf.save(`invoice-${order?.invoice_id}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
    setIsGenerating(false);
  };

  // Print function
  const handlePrint = () => {
    const printContent = invoiceRef.current.cloneNode(true);

    // Optimize for print
    printContent.style.width = "100%";
    printContent.style.maxWidth = "800px";
    printContent.style.margin = "0 auto";

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${order?.invoice_id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Inter', sans-serif;
              background: #ffffff;
              padding: 20px;
              display: flex;
              justify-content: center;
            }
            @media print {
              body { 
                padding: 0; 
                margin: 0;
              }
              .invoice-container {
                box-shadow: none !important;
                border: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container" style="width: 100%; max-width: 800px;">
            ${printContent.outerHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Share function
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${order?.invoice_id}`,
          text: `Order Invoice from ${setting?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      setShowShareOptions(!showShareOptions);
    }
  };

  // Copy link
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareOptions(false);
    alert("Link copied to clipboard!");
  };

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    const getStatusColor = () => {
      switch (status) {
        case "delivered":
          return "bg-emerald-100 text-emerald-700 border-emerald-200";
        case "processing":
          return "bg-blue-100 text-blue-700 border-blue-200";
        case "shipped":
          return "bg-purple-100 text-purple-700 border-purple-200";
        case "cancel":
          return "bg-rose-100 text-rose-700 border-rose-200";
        default:
          return "bg-orange-100 text-orange-700 border-orange-200";
      }
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor()}`}
      >
        {status?.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-3 sm:px-4 md:px-6 lg:px-8">
      {/* Action Buttons - Sticky below navbar (120px from top) */}
      <div className="sticky top-[100px] z-40 mb-4 flex flex-wrap items-center justify-between gap-2 bg-white/80 backdrop-blur-md p-3 rounded-xl shadow-lg border border-gray-200/50">
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={downloadPDF}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-[#234E7C] hover:bg-[#183C63] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 shadow-sm"
          >
            <FaDownload size={14} />
            <span className="hidden xs:inline">
              {isGenerating ? "Generating..." : "Download PDF"}
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#673E39] hover:bg-[#53312D] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <FaPrint size={14} />
            <span className="hidden xs:inline">Print</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className="flex items-center gap-2 bg-[#E2C8AE] hover:bg-[#D5B08C] text-[#3E2723] px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <FaShare size={14} />
            <span className="hidden xs:inline">Share</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={order?.order_status} />
          <span className="text-xs text-gray-500 hidden sm:inline font-mono bg-gray-100 px-2 py-1 rounded">
            #{order?.invoice_id}
          </span>
        </div>
      </div>

      {/* Share Options Dropdown */}
      {showShareOptions && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-4 top-[180px] bg-white rounded-xl shadow-xl p-2 z-50 border border-gray-200"
        >
          <button
            onClick={copyLink}
            className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm"
          >
            <FaCopy size={14} className="text-gray-500" />
            Copy Link
          </button>
        </motion.div>
      )}

      {/* Main Invoice Card - Square Shape with Secondary Color Accent */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        ref={invoiceRef}
        className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200"
        style={{ maxWidth: "800px" }}
      >
        {/* Header with Primary Color */}
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
              <img
                src={setting?.logo}
                alt={setting?.title}
                className="w-12 h-12 rounded bg-white p-1"
              />
            </div>
          </div>
        </div>

        {/* Content with Secondary Color Accent Line */}
        <div className="p-6">
          {/* Secondary Color Accent Line */}
          <div className="h-1 w-20 bg-[#673E39] mb-6"></div>

          {/* Customer Info - Square Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Billing Address Card */}
            <div className="border border-gray-200 p-5 hover:shadow-md transition-shadow">
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

            {/* Order Info Card */}
            <div className="border border-gray-200 p-5 hover:shadow-md transition-shadow">
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
                <FaBoxOpen className="text-[#234E7C]" />
                Order Items
              </h3>
            </div>

            {/* Mobile View - Cards */}
            <div className="block sm:hidden p-3 space-y-3">
              {products?.map((product, idx) => (
                <div key={idx} className="border border-gray-200 p-3">
                  <div className="flex gap-3">
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

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products?.map((product, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
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
                        <div className="flex items-center gap-1">
                          {product?.product_unit_price >
                          product?.product_unit_final_price ? (
                            <>
                              <span className="line-through text-gray-400 text-xs">
                                ৳{product?.product_unit_price}
                              </span>
                              <span className="font-medium text-[#234E7C]">
                                ৳{product?.product_unit_final_price}
                              </span>
                            </>
                          ) : (
                            <span className="font-medium">
                              ৳{product?.product_unit_price}
                            </span>
                          )}
                        </div>
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

          {/* Price Summary - Square Card */}
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

          {/* Footer Section */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            {/* Thank You Message */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#F0E9E8] rounded-full mb-3">
                <FaCheckCircle className="text-[#673E39] text-xl" />
              </div>
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-1">
                Thank You for Your Order!
              </h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                We appreciate your business and hope you enjoy your purchase.
              </p>
            </div>

            {/* Store Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-[#0D1B2A] text-sm uppercase tracking-wider flex items-center gap-2">
                  <FaStore className="text-[#234E7C]" />
                  Store Information
                </h4>
                <div className="space-y-1.5 text-sm">
                  <p className="flex items-center gap-2 text-gray-600">
                    <FaPhone className="text-gray-400" size={12} />
                    {setting?.contact}
                  </p>
                  <p className="flex items-center gap-2 text-gray-600">
                    <FaEnvelope className="text-gray-400" size={12} />
                    {setting?.email}
                  </p>
                  <p className="flex items-center gap-2 text-gray-600">
                    <FaGlobe className="text-gray-400" size={12} />
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

            {/* Copyright */}
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
