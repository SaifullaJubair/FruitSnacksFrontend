// src/components/utils/pageSeo.js
// ✅ সব static page এর SEO এক জায়গায়
// Site change করলে শুধু এই file এর values change করলেই হবে
// ⚠️ description এ site নাম hardcode করবে না — buildPageMeta এ siteName inject হয়

export const PAGE_SEO = {
  home: {
    title: "Premium Genuine Leather Wallets, Bags & Belts Bangladesh",
    description:
      "Bangladesh এর সেরা genuine leather wallet, bag ও belt। High quality pure leather, reasonable price। Cash on delivery সারাদেশে।",
    path: "",
  },
  allProducts: {
    title: "All Products",
    description:
      "সব genuine leather products। Wallet, bag, belt সহ আরো অনেক কিছু। Best price, fast delivery সারাদেশে।",
    path: "all-products",
  },
  allTrending: {
    title: "Trending Products",
    description:
      "সবচেয়ে popular trending leather products। Best sellers, top rated।",
    path: "all-trending-products",
  },
  newArrival: {
    title: "New Arrivals",
    description: "নতুন leather products। Latest collection, fresh arrivals।",
    path: "new-arrival",
  },
  topProduct: {
    title: "Top Products",
    description:
      "Top rated leather products। Customer favorites, best quality।",
    path: "top-product",
  },
  latestProduct: {
    title: "Latest Products",
    description: "সর্বশেষ leather products। Just launched, fresh stock।",
    path: "latest-product",
  },
  aboutUs: {
    title: "About Us",
    description:
      "Bangladesh এর trusted genuine leather products store সম্পর্কে জানুন।",
    path: "about-us",
  },
  privacyPolicy: {
    title: "Privacy Policy",
    description:
      "আপনার privacy আমাদের কাছে সর্বোচ্চ গুরুত্বপূর্ণ। আমাদের privacy policy পড়ুন।",
    path: "privacy-policy",
  },
  returnPolicy: {
    title: "Return Policy",
    description: "আমাদের return policy সম্পর্কে বিস্তারিত জানুন।",
    path: "return-policy",
  },
  refundPolicy: {
    title: "Refund Policy",
    description: "আমাদের refund policy সম্পর্কে বিস্তারিত জানুন।",
    path: "refund-policy",
  },
  cancelPolicy: {
    title: "Cancellation Policy",
    description: "অর্ডার cancellation policy সম্পর্কে জানুন।",
    path: "cancel-policy",
  },
  shippingInfo: {
    title: "Shipping Information",
    description: "Delivery time, charge ও shipping সম্পর্কে বিস্তারিত জানুন।",
    path: "shipping-information",
  },
  termsCondition: {
    title: "Terms & Conditions",
    description: "আমাদের terms and conditions সম্পর্কে জানুন।",
    path: "terms-condition",
  },
  // ── Private pages — noindex ────────────────────────────
  signIn: {
    title: "Sign In",
    description: "",
    path: "sign-in",
    noIndex: true,
  },
  signUp: {
    title: "Sign Up",
    description: "",
    path: "sign-up",
    noIndex: true,
  },
  cart: {
    title: "Cart",
    description: "",
    path: "cart",
    noIndex: true,
  },
  wishlist: {
    title: "Wishlist",
    description: "",
    path: "wishlist",
    noIndex: true,
  },
  verify: {
    title: "Verify Account",
    description: "",
    path: "verify",
    noIndex: true,
  },
  changePassword: {
    title: "Change Password",
    description: "",
    path: "change-password",
    noIndex: true,
  },
  forgetPassword: {
    title: "Forget Password",
    description: "",
    path: "forget-password",
    noIndex: true,
  },
  offer: {
    title: "Offers",
    description: "",
    path: "offer",
    noIndex: true,
  },
  orders: {
    title: "Orders",
    description: "",
    path: "orders",
    noIndex: true,
  },
  orderSuccess: {
    title: "Order Success",
    description: "",
    path: "order-success",
    noIndex: true,
  },
  shop: {
    title: "Shop",
    description: "",
    path: "shop",
    noIndex: true,
  },
};
