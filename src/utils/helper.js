import { useCallback, useMemo } from "react";
// export const productPrice = (product) => {
//   if (product?.flash_sale_details?.flash_sale_product) {
//     return product?.flash_sale_details?.flash_sale_product
//       ?.flash_sale_product_price;
//   } else if (product?.campaign_details) {
//     return product?.campaign_details?.campaign_product?.campaign_product_price;
//   } else if (product?.is_variation) {
//     return product?.variations?.variation_discount_price
//       ? product?.variations?.variation_discount_price
//       : product?.variations?.variation_price;
//   } else {
//     return product?.product_discount_price
//       ? product?.product_discount_price
//       : product?.product_price;
//   }
// };

export const productPrice = (product) => {
  // Check Flash Sale Details
  let price =
    product?.is_variation && product?.variations
      ? product?.variations?.variation_discount_price
        ? product?.variations?.variation_discount_price
        : product?.variations?.variation_price
      : product?.product_discount_price
      ? product?.product_discount_price
      : product?.product_price;
  if (product?.flash_sale_details?.flash_sale_product) {
    const flashProduct = product?.flash_sale_details.flash_sale_product;
    const priceType = flashProduct?.flash_price_type;
    const discountPrice = flashProduct?.flash_sale_product_price;
    const originalPrice = price;

    if (priceType) {
      return calculatePrice(originalPrice, discountPrice, priceType);
    }
    return discountPrice; // Fallback if no price type is specified
  }

  // Check Campaign Details
  if (product?.campaign_details?.campaign_product) {
    const campaignProduct = product?.campaign_details?.campaign_product;
    const priceType = campaignProduct?.campaign_price_type;
    const discountPrice = campaignProduct?.campaign_product_price;
    const originalPrice = price;
    if (priceType) {
      return calculatePrice(originalPrice, discountPrice, priceType);
    }
    return discountPrice; // Fallback if no price type is specified
  }

  // Check for Product Variations
  if (product?.is_variation && product?.variations) {
    return product?.variations?.variation_discount_price
      ? product?.variations?.variation_discount_price
      : product?.variations?.variation_price;
  }

  // Default Product Price
  return product?.product_discount_price
    ? product?.product_discount_price
    : product?.product_price;
};

export const lineThroughPrice = (product) => {
  if (
    product?.variations?.variation_discount_price ||
    product?.product_discount_price
  ) {
    return product?.variations?.variation_price || product?.product_price;
  }
  return null;
};

export const calculatePrice = (originalPrice, discount, type) => {
  if (type === "percent") {
    const roundPrice = Math.round(
      originalPrice - (originalPrice * discount) / 100
    );
    return roundPrice;
  } else if (type === "fixed") {
    return originalPrice - discount;
  }
  return originalPrice;
};

export const singleProductPrice = (product) => {
  // Helper function to calculate price based on type

  // Check Flash Sale Details
  if (product?.flash_sale_details?.flash_sale_product) {
    const flashProduct = product.flash_sale_details.flash_sale_product;
    const priceType = flashProduct?.flash_price_type;
    const discountPrice = flashProduct?.flash_sale_product_price;
    const originalPrice =
      product?.is_variation && product?.variations?.length > 0
        ? product?.variations?.[0]?.variation_discount_price
          ? product?.variations?.[0]?.variation_discount_price
          : product?.variations?.[0]?.variation_price
        : product?.product_discount_price
        ? product?.product_discount_price
        : product?.product_price;

    if (priceType) {
      return calculatePrice(originalPrice, discountPrice, priceType);
    }
    return discountPrice; // Fallback if no price type is specified
  }

  // Check Campaign Details
  if (product?.campaign_details?.campaign_product) {
    const campaignProduct = product?.campaign_details?.campaign_product;
    const priceType = campaignProduct?.campaign_price_type;
    const discountPrice = campaignProduct?.campaign_product_price;
    const originalPrice =
      product?.is_variation && product?.variations?.length > 0
        ? product?.variations?.[0]?.variation_discount_price
          ? product?.variations?.[0]?.variation_discount_price
          : product?.variations?.[0]?.variation_price
        : product?.product_discount_price
        ? product?.product_discount_price
        : product?.product_price;

    if (priceType) {
      return calculatePrice(originalPrice, discountPrice, priceType);
    }
    return discountPrice; // Fallback if no price type is specified
  }

  // Check for Product Variations
  if (product?.is_variation && product?.variations?.length > 0) {
    return product?.variations?.[0]?.variation_discount_price
      ? product?.variations?.[0]?.variation_discount_price
      : product?.variations?.[0]?.variation_price;
  }

  // Default Product Price
  return product?.product_discount_price
    ? product?.product_discount_price
    : product?.product_price;
};

export const updateRecentProducts = (product) => {
  const maxProducts = 5;
  let recentProducts =
    JSON.parse(localStorage.getItem("recent-products")) || [];
  // Remove existing product if it already exists
  recentProducts = recentProducts.filter(
    (item) => item?.product_slug !== product?.product_slug
  );
  // const productExistsIndex = recentProducts.findIndex(
  //   (item) => item?.product_slug === product?.product_slug
  // );
  // if (productExistsIndex !== -1) {
  //   recentProducts.splice(productExistsIndex, 1);
  // }

  // Add the new product to the beginning
  recentProducts.unshift(product);

  // if (recentProducts.length > maxProducts) {
  //   recentProducts.pop();
  // }
  recentProducts = recentProducts.slice(0, maxProducts);

  localStorage.setItem("recent-products", JSON.stringify(recentProducts));
};

// Helper function to check color is valid hex code
export const isHexColor = (code) => /^#([0-9A-F]{3}){1,2}$/i.test(code);

// Helper function to check if the URL is a video
export const isVideo = (url) => {
  if (!url) return false;
  return /\.(mp4|webm|mov|avi|mkv|flv|wmv|mpeg|mpg|3gp)$/i.test(url);
};

// Define helper functions with proper dependency injection
export const useCartCalculations = ({
  cartData,
  products,
  couponData,
  shippingCharge,
}) => {
  // Calculate price after applying coupon to a single product
 const calculationCouponProductPrice = useCallback(
   (price, productId, variationId = null) => {
     if (!couponData || !price) return price;

     // Check if product is eligible for specific coupon
     const isSpecificProduct =
       couponData.coupon_product_type === "specific" &&
       couponData.coupon_specific_product?.some((item) =>
         variationId
           ? item.product_id === productId // For variations, check against parent product ID
           : item.product_id === productId
       );

     // Only apply coupon if it's for all products or this specific product/variation
     if (couponData.coupon_product_type === "specific" && !isSpecificProduct) {
       return price;
     }

     // Fixed amount coupon
     if (couponData.coupon_type === "fixed") {
       return Math.max(price - couponData.coupon_amount, 0);
     }

     // Percentage coupon
     if (couponData.coupon_type === "percent") {
       const discountAmount = Math.round(
         (price * couponData.coupon_amount) / 100
       );
       const maxDiscount = couponData.coupon_max_amount || Infinity;
       const finalDiscount = Math.min(discountAmount, maxDiscount);
       return Math.max(price - finalDiscount, 0);
     }

     return price;
   },
   [couponData]
 );

  // Calculate grand total after applying cart-level coupons
  const calculateShopGrandTotals = useCallback(
    (subTotal) => {
      if (!couponData || couponData.coupon_product_type === "specific") {
        return subTotal; // Specific product coupons already applied at product level
      }

      // Fixed amount coupon for all products
      if (couponData.coupon_type === "fixed") {
        return Math.max(subTotal - couponData.coupon_amount, 0);
      }

      // Percentage coupon for all products
      if (couponData.coupon_type === "percent") {
        const discountAmount = Math.round(
          (subTotal * couponData.coupon_amount) / 100
        );
        const maxDiscount = couponData.coupon_max_amount || Infinity;
        const finalDiscount = Math.min(discountAmount, maxDiscount);
        return Math.max(subTotal - finalDiscount, 0);
      }

      return subTotal;
    },
    [couponData]
  );

  return useMemo(() => {
    if (!cartData?.length)
      return {
        shopSubtotals: 0,
        shopGrandTotals: 0,
        totalDiscount: 0,
        adjustedPrices: {},
      };

    // Calculate initial subtotal without any coupons
    const calculateInitialSubtotal = (product) => {
      const price = productPrice(product);
      const quantity =
        products?.find(
          (item) =>
            item?.productId === product?._id &&
            (!product?.variations?._id ||
              item?.variation_product_id === product?.variations?._id)
        )?.quantity || 1;
      return price * quantity;
    };

    const initialSubtotal = cartData.reduce(
      (sum, product) => sum + calculateInitialSubtotal(product),
      0
    );

    // Calculate adjusted prices and subtotal with product-level coupons
    const adjustedPrices = {};
    let subtotalWithProductCoupons = 0;

    cartData.forEach((product) => {
      const originalPrice = productPrice(product);
      const quantity =
        products?.find(
          (item) =>
            item?.productId === product?._id &&
            (!product?.variations?._id ||
              item?.variation_product_id === product?.variations?._id)
        )?.quantity || 1;

      // Create unique key for each product/variation combination
      const priceKey = product?.variations?._id
        ? `${product._id}-${product.variations._id}`
        : product._id;

      // Apply product-level coupons if applicable
      const finalPrice = calculationCouponProductPrice(
        originalPrice,
        product._id,
        product?.variations?._id
      );

      adjustedPrices[priceKey] = finalPrice;
      subtotalWithProductCoupons += finalPrice * quantity;
    });

    // Apply cart-level coupons if applicable
    const grandTotals = calculateShopGrandTotals(
      couponData?.coupon_product_type === "specific"
        ? subtotalWithProductCoupons
        : initialSubtotal
    );

    const totalDiscount = initialSubtotal - grandTotals;

    return {
      shopSubtotals: initialSubtotal,
      shopGrandTotals: grandTotals + shippingCharge,
      totalDiscount,
      adjustedPrices,
    };
  }, [
    cartData,
    products,
    couponData,
    shippingCharge,
    calculationCouponProductPrice,
    calculateShopGrandTotals,
  ]);
};
