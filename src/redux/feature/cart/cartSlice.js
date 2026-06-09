import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  totalQuantity: 0,
};

// Helper: same product+variation match করো
const isSameItem = (item, productId, variationId) => {
  if (variationId) {
    return (
      item.productId === productId && item.variation_product_id === variationId
    );
  }
  return item.productId === productId && !item.variation_product_id;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Add to cart
    addToCart: (state, action) => {
      const { productId, variation_product_id, quantity = 1, product_slug } = action.payload;
      const existing = state.products.find((p) =>
        isSameItem(p, productId, variation_product_id),
      );
      if (existing) {
        existing.quantity += quantity;
        state.totalQuantity += quantity;
      } else {
        state.products.push({
          productId,
          variation_product_id: variation_product_id || null,
          quantity,
          product_slug: product_slug || null,
        });
        state.totalQuantity += quantity;
      }
    },

    // Remove from cart
    removeFromCart: (state, action) => {
      const { productId, variation_product_id } = action.payload;
      const index = state.products.findIndex((p) =>
        isSameItem(p, productId, variation_product_id),
      );
      if (index !== -1) {
        state.totalQuantity -= state.products[index].quantity;
        state.products.splice(index, 1);
      }
    },

    // Atomic replace — 3 cases handled:
    // 1. Same variant → just update quantity
    // 2. New variant already in cart → remove old, merge qty into existing
    // 3. Clean replace → remove old, insert new
    replaceCartItem: (state, action) => {
      const {
        oldProductId,
        oldVariationId,
        newProductId,
        newVariationId,
        qty,
        newSlug,
      } = action.payload;

      const oldIndex = state.products.findIndex((p) =>
        isSameItem(p, oldProductId, oldVariationId),
      );
      if (oldIndex === -1) return;
      const oldQty = state.products[oldIndex].quantity;
      const finalQty = qty ?? oldQty;

      // Case 1: same variant → update qty only
      if (oldProductId === newProductId && oldVariationId === newVariationId) {
        const diff = finalQty - oldQty;
        state.products[oldIndex].quantity = finalQty;
        state.totalQuantity += diff;
        return;
      }

      // Case 2: new variant already in cart → remove old, merge qty
      const existingNewIndex = state.products.findIndex((p) =>
        isSameItem(p, newProductId, newVariationId),
      );
      if (existingNewIndex !== -1) {
        state.totalQuantity -= oldQty;
        state.products.splice(oldIndex, 1);
        const adjusted = existingNewIndex > oldIndex ? existingNewIndex - 1 : existingNewIndex;
        state.products[adjusted].quantity += finalQty;
        state.totalQuantity += finalQty;
        return;
      }

      // Case 3: clean replace
      state.totalQuantity -= oldQty;
      state.products.splice(oldIndex, 1, {
        productId: newProductId,
        variation_product_id: newVariationId || null,
        quantity: finalQty,
        product_slug: newSlug || null,
      });
      state.totalQuantity += finalQty;
    },

    // Increment quantity
    incrementQuantity: (state, action) => {
      const { productId, variation_product_id, maxStock } = action.payload;
      const item = state.products.find((p) =>
        isSameItem(p, productId, variation_product_id),
      );
      if (item && item.quantity < maxStock) {
        item.quantity += 1;
        state.totalQuantity += 1;
      }
    },

    // Decrement quantity
    decrementQuantity: (state, action) => {
      const { productId, variation_product_id } = action.payload;
      const item = state.products.find((p) =>
        isSameItem(p, productId, variation_product_id),
      );
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        state.totalQuantity -= 1;
      }
    },

    // Update quantity directly (input field থেকে)
    updateQuantity: (state, action) => {
      const { productId, variation_product_id, quantity, maxStock } =
        action.payload;
      const item = state.products.find((p) =>
        isSameItem(p, productId, variation_product_id),
      );
      if (item) {
        const max = maxStock || 9999;
        const newQty = Math.max(1, Math.min(parseInt(quantity) || 1, max));
        state.totalQuantity = state.totalQuantity - item.quantity + newQty;
        item.quantity = newQty;
      }
    },

    // Login এর পরে DB থেকে cart load করো (DB cart > localStorage cart)
    setCartFromDB: (state, action) => {
      const dbProducts = action.payload; // [{product_id, variation_id, quantity, product_slug?}]
      if (!dbProducts?.length) return;

      state.products = dbProducts.map((item) => ({
        productId: item.product_id,
        variation_product_id: item.variation_id || null,
        quantity: item.quantity,
        product_slug: item.product_slug || null,
      }));
      state.totalQuantity = state.products.reduce(
        (sum, p) => sum + p.quantity,
        0,
      );
    },

    // Cart clear করো (order complete বা logout)
    allRemoveFromCart: (state) => {
      state.products = [];
      state.totalQuantity = 0;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  allRemoveFromCart,
  decrementQuantity,
  incrementQuantity,
  updateQuantity,
  setCartFromDB,
  replaceCartItem,
} = cartSlice.actions;

export default cartSlice.reducer;
