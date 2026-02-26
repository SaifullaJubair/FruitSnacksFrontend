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
      const { productId, variation_product_id, quantity = 1 } = action.payload;
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
        });
        state.totalQuantity += quantity;
      }
    },

    // Remove from cart (পুরো item সরিয়ে দাও)
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
        const newQty = Math.max(1, Math.min(parseInt(quantity) || 1, maxStock));
        state.totalQuantity = state.totalQuantity - item.quantity + newQty;
        item.quantity = newQty;
      }
    },

    // Login এর পরে DB থেকে cart load করো (DB cart > localStorage cart)
    setCartFromDB: (state, action) => {
      const dbProducts = action.payload; // [{product_id, variation_id, quantity}]
      if (!dbProducts?.length) return;

      // DB format থেকে Redux format এ convert করো
      state.products = dbProducts.map((item) => ({
        productId: item.product_id,
        variation_product_id: item.variation_id || null,
        quantity: item.quantity,
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
} = cartSlice.actions;

export default cartSlice.reducer;
