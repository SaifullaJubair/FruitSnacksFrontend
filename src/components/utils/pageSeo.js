// src/components/utils/pageSeo.js
// ✅ সব static page এর SEO এক জায়গায়
// Site change করলে শুধু এই file এর values change করলেই হবে
// ⚠️ description এ site নাম hardcode করবে না — buildPageMeta এ siteName inject হয়

export const PAGE_SEO = {
  home: {
    // Generic Bangla fallback — admin overrides via /page-seo "home" entry
    // for actual product-line copy (replaces this for each clone).
    title: "প্রিমিয়াম মানসম্পন্ন পণ্য | ফাস্ট ক্যাশ অন ডেলিভারি",
    description:
      "প্রিমিয়াম কোয়ালিটির পণ্য সংগ্রহ। সারা বাংলাদেশে দ্রুত হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা।",
    path: "",
  },
  allProducts: {
    // Product-line-neutral, like `home` above: this file is the fallback used when
    // a page has no /page-seo row, and it ships to every clone of this codebase.
    // It used to describe the leather wallets, bags and belts of the shop this was
    // cloned from — which is what a fruit-snack storefront served to Google. The
    // owner sets real copy from Admin → Page SEO; these only fill the gap.
    title: "All Products | Full Collection",
    description:
      "আমাদের সম্পূর্ণ প্রোডাক্ট কালেকশন দেখুন। প্রিমিয়াম কোয়ালিটি, সেরা দাম ও সারা বাংলাদেশে হোম ডেলিভারি।",
    path: "all-products",
    noIndex: true,
  },
  allTrending: {
    title: "Trending Products | Best Sellers",
    description:
      "বর্তমানে সবচেয়ে জনপ্রিয় ও ট্রেন্ডিং প্রোডাক্টগুলো দেখে নিন। কাস্টমারদের পছন্দের শীর্ষে থাকা আইটেম এখন এক জায়গায়।",
    path: "all-trending-products",
    noIndex: true,
  },
  newArrival: {
    title: "New Arrivals | Latest Collection",
    description:
      "আমাদের স্টকে আসা একদম নতুন প্রোডাক্টগুলো দেখুন। লেটেস্ট কালেকশন থেকে আপনার পছন্দের পণ্যটি বেছে নিন।",
    path: "new-arrival",
    noIndex: true,
  },
  topProduct: {
    title: "Top Rated Products | Best Quality",
    description:
      "সবচেয়ে বেশি বিক্রিত এবং টপ রেটেড আইটেম। আমাদের সেরা কোয়ালিটির কালেকশন দেখুন।",
    path: "top-product",
    noIndex: true,
  },
  latestProduct: {
    title: "Latest Products | Just Launched",
    description:
      "নতুন এবং এক্সক্লুসিভ সব প্রোডাক্ট। আমাদের লেটেস্ট কালেকশন দেখে নিন।",
    path: "latest-product",
    noIndex: true,
  },
  aboutUs: {
    title: "About Us | Our Story & Values",
    description:
      "মানসম্পন্ন পণ্য ও নির্ভরযোগ্য সেবায় আমরা একটি বিশ্বস্ত নাম। আমাদের পণ্যের গুণগত মান সম্পর্কে জানুন।",
    path: "about-us",
  },
  privacyPolicy: {
    title: "Privacy Policy | Security & Data Protection",
    description:
      "আপনার ব্যক্তিগত তথ্যের নিরাপত্তা আমাদের কাছে সর্বোচ্চ অগ্রাধিকার। আমাদের প্রাইভেসী পলিসি সম্পর্কে বিস্তারিত জানুন এখানে।",
    path: "privacy-policy",
  },
  returnPolicy: {
    title: "Return & Exchange Policy | Easy & Fast Returns",
    description:
      "পণ্য হাতে পাওয়ার পর কোনো সমস্যা থাকলে সহজে রিটার্ন বা এক্সচেঞ্জ করার সুবিধা। আমাদের রিটার্ন পলিসি সম্পর্কে বিস্তারিত জানুন।",
    path: "return-policy",
  },
  refundPolicy: {
    title: "Refund Policy | Secure Refund Process",
    description:
      "আমাদের রিফান্ড পলিসি এবং টাকা ফেরত পাওয়ার প্রক্রিয়া সম্পর্কে বিস্তারিত তথ্য এখানে দেখুন।",
    path: "refund-policy",
  },
  cancelPolicy: {
    title: "Order Cancellation Policy | Shopping Terms",
    description:
      "অর্ডার ক্যান্সেলেশন বা বাতিল করার নিয়মাবলী এবং শর্তাবলী সম্পর্কে বিস্তারিত জেনে নিন।",
    path: "cancel-policy",
  },
  shippingInfo: {
    title: "Shipping & Delivery Information | Fast Home Delivery",
    description:
      "সারা বাংলাদেশে দ্রুত ডেলিভারি! শিপিং চার্জ, ডেলিভারি সময় এবং কুরিয়ার সার্ভিস সংক্রান্ত সব তথ্য এখানে পাবেন।",
    path: "shipping-information",
  },
  termsCondition: {
    title: "Terms & Conditions | Shopping Rules",
    description:
      "আমাদের ওয়েবসাইট থেকে কেনাকাটার নিয়মাবলী এবং শর্তাবলী সম্পর্কে বিস্তারিত পড়ে নিন।",
    path: "terms-condition",
  },
  // ── Private pages — noindex ────────────────────────────
  signIn: {
    title: "Login to Your Account",
    description: "",
    path: "sign-in",
    noIndex: true,
  },
  signUp: {
    title: "Create a New Account",
    description: "",
    path: "sign-up",
    noIndex: true,
  },
  checkout: {
    title: "Checkout",
    description: "",
    path: "checkout",
    noIndex: true,
  },
  "order-tracking": {
    title: "Order Tracking",
    description: "Track your order status — enter your invoice ID to see live delivery progress.",
    path: "orders/order-tracking",
    noIndex: true,
  },
  wishlist: {
    title: "Your Wishlist | Saved Items",
    description: "",
    path: "wishlist",
    noIndex: true,
  },
  verify: {
    title: "Verify Your Account",
    description: "",
    path: "verify",
    noIndex: true,
  },
  changePassword: {
    title: "Change Your Password",
    description: "",
    path: "change-password",
    noIndex: true,
  },
  forgetPassword: {
    title: "Reset Your Password",
    description: "",
    path: "forget-password",
    noIndex: true,
  },
  setPassowrd: {
    title: "Set Your Password",
    description: "",
    path: "set-password",
    noIndex: true,
  },
  offer: {
    title: "Special Offers & Discounts",
    description:
      "Grab the latest deals, bundles and discounts. Limited-time offers with cash on delivery.",
    path: "offer",
    noIndex: false, // public offers page — should be indexed
  },
  orders: {
    title: "Order History | Track Your Orders",
    description: "",
    path: "orders",
    noIndex: true,
  },
  orderSuccess: {
    title: "Order Successful | Thank You!",
    description: "",
    path: "order-success",
    noIndex: true,
  },
  shop: {
    title: "Shop All Products",
    description:
      "Browse our full product collection. Quality items at the best price with fast cash on delivery.",
    path: "shop",
    noIndex: false, // main product-listing page — must be indexed
  },
};

/**
 * Need to add more pages
 * all-brands page
 * all-brands/brand-product
 * all-brands/brand-product/[id]
 * all-ecommerce-product
 * campaign
 * campaign/[id]
 * checkout
 * compare
 * offer/[id]
 * orders/order-tracking/page.js
 * orders/order-tracking/[id]/page.jsx
 * verify  Page
 * src/app/(user-profile)/user-profile/page.jsx
 */
