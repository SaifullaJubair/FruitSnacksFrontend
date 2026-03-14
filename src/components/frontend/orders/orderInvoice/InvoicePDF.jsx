"use client";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// ── Convert external URL → base64 so react-pdf can embed it ──────────────────
export async function urlToBase64(url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ── Pre-fetch logo + all product images before rendering PDF ─────────────────
export async function prefetchImages(products, setting) {
  const logoB64 = await urlToBase64(setting?.logo);
  const productImages = await Promise.all(
    (products || []).map(async (p) => {
      const url = p?.variation_id?.variation_image || p?.product_id?.main_image;
      return url ? await urlToBase64(url) : null;
    }),
  );
  return { logoB64, productImages };
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    paddingBottom: 24,
  },

  // Header
  header: {
    backgroundColor: "#0D1B2A",
    paddingHorizontal: 28,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  invoiceLabel: {
    color: "#ffffff",
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 3,
  },
  invoiceId: { color: "#7A8FA6", fontSize: 8, marginTop: 2, letterSpacing: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 14 },
  dateBox: {
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#2a3f55",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  dateLabel: { color: "#7A8FA6", fontSize: 7, letterSpacing: 0.5 },
  dateValue: {
    color: "#ffffff",
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },
  logo: { width: 42, height: 42, borderRadius: 4, backgroundColor: "#ffffff" },

  accentBar: { height: 3, backgroundColor: "#234E7C" },
  body: { paddingHorizontal: 28, paddingTop: 16 },

  // Status
  statusRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
  },
  badgePending: { backgroundColor: "#FFF3CD", color: "#856404" },
  badgeDelivered: { backgroundColor: "#D1FAE5", color: "#065F46" },
  badgeProcessing: { backgroundColor: "#DBEAFE", color: "#1E40AF" },
  badgeShipped: { backgroundColor: "#EDE9FE", color: "#5B21B6" },
  badgeCancel: { backgroundColor: "#FFE4E6", color: "#9F1239" },

  // Delivery banner — blue dot instead of emoji
  deliveryBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 12,
  },
  deliveryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
    marginRight: 8,
  },
  deliveryText: {
    fontSize: 8.5,
    color: "#1D4ED8",
    fontFamily: "Helvetica-Bold",
  },

  // Info cards
  infoRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  infoCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    padding: 12,
    backgroundColor: "#FAFAFA",
  },
  infoCardAccent: {
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#234E7C",
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#234E7C",
    letterSpacing: 1.2,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  infoName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0D1B2A",
    marginBottom: 3,
  },
  infoText: {
    fontSize: 8.5,
    color: "#4B5563",
    lineHeight: 1.5,
    marginBottom: 1,
  },
  infoRow2: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  infoKey: { fontSize: 8.5, color: "#6B7280" },
  infoVal: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#0D1B2A" },

  // Table
  tableWrap: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    marginBottom: 12,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#EEF2F7",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tableHeaderTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#234E7C",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    alignItems: "center",
  },
  tableRowLast: { borderBottomWidth: 0 },
  tableRowAlt: { backgroundColor: "#F9FAFB" },
  colNum: { width: 22 },
  colProduct: { flex: 1 },
  colPrice: { width: 58 },
  colQty: { width: 28 },
  colTotal: { width: 58 },
  colText: { fontSize: 8.5, color: "#6B7280" },
  productThumb: {
    width: 34,
    height: 34,
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: "#E5E7EB",
  },
  productName: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#0D1B2A",
  },
  productVariant: { fontSize: 7.5, color: "#9CA3AF", marginTop: 1 },
  priceOriginal: {
    fontSize: 7.5,
    color: "#9CA3AF",
    textDecoration: "line-through",
    textAlign: "right",
  },
  priceFinal: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#234E7C",
    textAlign: "right",
  },
  totalText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#234E7C",
    textAlign: "right",
  },

  // Summary
  summaryWrap: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 14,
  },
  summaryBox: {
    width: 210,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
  },
  summaryTitle: {
    backgroundColor: "#EEF2F7",
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#234E7C",
    letterSpacing: 1,
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  summaryBody: { padding: 12 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  summaryKey: { fontSize: 8.5, color: "#6B7280" },
  summaryVal: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#0D1B2A" },
  summaryDiscount: { fontSize: 8.5, color: "#16A34A" },
  summaryDivider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 6 },
  grandKey: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#0D1B2A" },
  grandVal: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#234E7C" },

  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginHorizontal: 28,
    paddingTop: 14,
  },
  thankYou: { alignItems: "center", marginBottom: 12 },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  checkMark: { fontSize: 14, color: "#065F46", fontFamily: "Helvetica-Bold" },
  thankYouText: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0D1B2A",
    marginBottom: 3,
  },
  thankYouSub: { fontSize: 8, color: "#6B7280" },
  footerGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  footerCol: { flex: 1 },
  footerTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#0D1B2A",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  footerText: {
    fontSize: 8,
    color: "#6B7280",
    marginBottom: 3,
    lineHeight: 1.5,
  },

  // Social — colored text badges instead of SVG icons
  socialRow: { flexDirection: "row", gap: 5, marginTop: 2, flexWrap: "wrap" },
  socialBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
  },
  socialFb: { backgroundColor: "#DBEAFE", color: "#1D4ED8" },
  socialIg: { backgroundColor: "#FCE7F3", color: "#9D174D" },
  socialWa: { backgroundColor: "#D1FAE5", color: "#065F46" },
  socialYt: { backgroundColor: "#FEE2E2", color: "#991B1B" },

  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerCopy: { fontSize: 7, color: "#9CA3AF" },
  footerNote: { fontSize: 7, color: "#9CA3AF", fontStyle: "italic" },
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const getBadgeStyle = (status) =>
  ({
    delivered: S.badgeDelivered,
    processing: S.badgeProcessing,
    shipped: S.badgeShipped,
    cancel: S.badgeCancel,
  })[status] || S.badgePending;

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

// ── Main PDF Document ─────────────────────────────────────────────────────────
// Pass `images` prop from prefetchImages() — { logoB64, productImages: string[] }
const InvoicePDFDocument = ({ order, products, setting, images }) => {
  const subtotal = products?.reduce(
    (acc, p) => acc + p.product_grand_total_price,
    0,
  );
  const deliveryMessage = getDeliveryMessage(order?.shipping_location);
  const { logoB64, productImages } = images || {};

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={S.header}>
          <View>
            <Text style={S.invoiceLabel}>INVOICE</Text>
            <Text style={S.invoiceId}>#{order?.invoice_id}</Text>
          </View>
          <View style={S.headerRight}>
            <View style={S.dateBox}>
              <Text style={S.dateLabel}>Order Date</Text>
              <Text style={S.dateValue}>
                {new Date(order?.pending_time).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
            {logoB64 && <Image style={S.logo} src={logoB64} />}
          </View>
        </View>

        <View style={S.accentBar} />

        {/* Body */}
        <View style={S.body}>
          {/* Status */}
          <View style={S.statusRow}>
            <Text style={[S.badge, getBadgeStyle(order?.order_status)]}>
              {order?.order_status?.toUpperCase()}
            </Text>
          </View>

          {/* Delivery banner */}
          {deliveryMessage && (
            <View style={S.deliveryBanner}>
              <View style={S.deliveryDot} />
              <Text style={S.deliveryText}>{deliveryMessage}</Text>
            </View>
          )}

          {/* Info cards */}
          <View style={S.infoRow}>
            <View style={S.infoCard}>
              <View style={S.infoCardAccent} />
              <Text style={S.infoCardTitle}>Billing Address</Text>
              <Text style={S.infoName}>{order?.customer_id?.user_name}</Text>
              <Text style={S.infoText}>
                {order?.customer_phone || order?.customer_id?.user_phone}
              </Text>
              <Text style={S.infoText}>
                {order?.billing_address}, {order?.billing_city},{" "}
                {order?.billing_state}, {order?.billing_country}
              </Text>
            </View>

            <View style={S.infoCard}>
              <View
                style={[S.infoCardAccent, { backgroundColor: "#673E39" }]}
              />
              <Text style={S.infoCardTitle}>Order Info</Text>
              {[
                { k: "Items", v: `${products?.length} Products` },
                { k: "Shipping", v: order?.shipping_location },
                {
                  k: "Payment",
                  v: order?.payment_method || "Cash on Delivery",
                },
              ].map(({ k, v }) => (
                <View key={k} style={S.infoRow2}>
                  <Text style={S.infoKey}>{k}:</Text>
                  <Text style={S.infoVal}>{v}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Products table */}
          <View style={S.tableWrap}>
            <View style={S.tableHeader}>
              <View style={S.colNum}>
                <Text style={S.tableHeaderTitle}>#</Text>
              </View>
              <View style={S.colProduct}>
                <Text style={S.tableHeaderTitle}>Product</Text>
              </View>
              <View style={S.colPrice}>
                <Text style={[S.tableHeaderTitle, { textAlign: "right" }]}>
                  Price
                </Text>
              </View>
              <View style={S.colQty}>
                <Text style={[S.tableHeaderTitle, { textAlign: "center" }]}>
                  Qty
                </Text>
              </View>
              <View style={S.colTotal}>
                <Text style={[S.tableHeaderTitle, { textAlign: "right" }]}>
                  Total
                </Text>
              </View>
            </View>

            {products?.map((product, idx) => (
              <View
                key={idx}
                style={[
                  S.tableRow,
                  idx % 2 !== 0 && S.tableRowAlt,
                  idx === products.length - 1 && S.tableRowLast,
                ]}
              >
                <View style={S.colNum}>
                  <Text style={S.colText}>{idx + 1}</Text>
                </View>

                <View
                  style={[
                    S.colProduct,
                    { flexDirection: "row", alignItems: "center" },
                  ]}
                >
                  {/* base64 image — no CORS, no blank box */}
                  {productImages?.[idx] ? (
                    <Image style={S.productThumb} src={productImages[idx]} />
                  ) : (
                    <View style={S.productThumb} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={S.productName}>
                      {product?.product_id?.product_name}
                    </Text>
                    {product?.variation_id && (
                      <Text style={S.productVariant}>
                        {product?.variation_id?.variation_name}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={S.colPrice}>
                  {product?.product_unit_price >
                  product?.product_unit_final_price ? (
                    <View>
                      <Text style={S.priceOriginal}>
                        Tk {product?.product_unit_price}
                      </Text>
                      <Text style={S.priceFinal}>
                        Tk {product?.product_unit_final_price}
                      </Text>
                    </View>
                  ) : (
                    <Text style={S.priceFinal}>
                      Tk {product?.product_unit_price}
                    </Text>
                  )}
                </View>

                <View style={S.colQty}>
                  <Text style={[S.colText, { textAlign: "center" }]}>
                    {product?.product_quantity}
                  </Text>
                </View>

                <View style={S.colTotal}>
                  <Text style={S.totalText}>
                    Tk {product?.product_grand_total_price}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Price summary */}
          <View style={S.summaryWrap}>
            <View style={S.summaryBox}>
              <Text style={S.summaryTitle}>Price Summary</Text>
              <View style={S.summaryBody}>
                <View style={S.summaryRow}>
                  <Text style={S.summaryKey}>Subtotal:</Text>
                  <Text style={S.summaryVal}>Tk {subtotal}</Text>
                </View>
                <View style={S.summaryRow}>
                  <Text style={S.summaryKey}>Shipping:</Text>
                  <Text style={S.summaryVal}>Tk {order?.shipping_cost}</Text>
                </View>
                {order?.discount_amount > 0 && (
                  <View style={S.summaryRow}>
                    <Text style={S.summaryDiscount}>Discount:</Text>
                    <Text style={S.summaryDiscount}>
                      - Tk {order?.discount_amount}
                    </Text>
                  </View>
                )}
                <View style={S.summaryDivider} />
                <View style={S.summaryRow}>
                  <Text style={S.grandKey}>Grand Total:</Text>
                  <Text style={S.grandVal}>Tk {order?.grand_total_amount}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={S.footer}>
          <View style={S.thankYou}>
            <View style={S.checkCircle}>
              <Text style={S.checkMark}>✓</Text>
            </View>
            <Text style={S.thankYouText}>Thank You for Your Order!</Text>
            <Text style={S.thankYouSub}>
              We appreciate your business and hope you enjoy your purchase.
            </Text>
          </View>

          <View style={S.footerGrid}>
            <View style={S.footerCol}>
              <Text style={S.footerTitle}>Store Information</Text>
              <Text style={S.footerText}>{setting?.contact}</Text>
              <Text style={S.footerText}>{setting?.email}</Text>
              <Text style={S.footerText}>{setting?.address}</Text>
            </View>
            <View style={[S.footerCol, { alignItems: "flex-end" }]}>
              <Text style={S.footerTitle}>Follow Us</Text>
              <View style={S.socialRow}>
                {setting?.facebook && (
                  <Text style={[S.socialBadge, S.socialFb]}>Facebook</Text>
                )}
                {setting?.instagram && (
                  <Text style={[S.socialBadge, S.socialIg]}>Instagram</Text>
                )}
                {setting?.watsapp && (
                  <Text style={[S.socialBadge, S.socialWa]}>WhatsApp</Text>
                )}
                {setting?.you_tube && (
                  <Text style={[S.socialBadge, S.socialYt]}>YouTube</Text>
                )}
              </View>
            </View>
          </View>

          <View style={S.footerBottom}>
            <Text style={S.footerCopy}>
              © {new Date().getFullYear()} {setting?.title}. All rights
              reserved.
            </Text>
            <Text style={S.footerNote}>
              Computer generated invoice — no signature required.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDFDocument;
