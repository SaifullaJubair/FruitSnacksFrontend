import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const initialState = {
  products: [],
  totalQuantity: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { productId, variation_product_id, quantity } = action.payload;

      // Check if the product (with or without variation) is already in the cart
      const existingProduct = state.products.find((p) => {
        if (variation_product_id) {
          return (
            p.productId === productId &&
            p.variation_product_id === variation_product_id
          );
        }
        return p.productId === productId && !p.variation_product_id;
      });

      if (!existingProduct) {
        // If the product/variation is not in the cart, add it
        state.products.push({ productId, variation_product_id, quantity });
        // Update total quantity
        state.totalQuantity += quantity;
      } else {
        // If the product/variation already exists, update its quantity
        existingProduct.quantity += quantity;
        // Update total quantity
        state.totalQuantity += quantity;
      }
    },
    removeFromCart: (state, action) => {
      const {
        productId,
        variation_product_id,
        product_quantity: quantity,
      } = action.payload;

      // Find the index of the product/variation in the cart
      const indexToRemove = state.products.findIndex((p) => {
        if (variation_product_id) {
          return (
            p.productId === productId &&
            p.variation_product_id === variation_product_id
          );
        }
        return p.productId === productId && !p.variation_product_id;
      });

      if (indexToRemove !== -1) {
        // Update the product quantity in the cart
        const productToRemove = state.products[indexToRemove];

        if (productToRemove.quantity > quantity) {
          // Decrease the quantity if more than the quantity to remove
          productToRemove.quantity -= quantity;
          state.totalQuantity -= quantity;
        } else {
          // Remove the product entirely if the quantity matches or is less
          state.totalQuantity -= productToRemove.quantity;
          state.products.splice(indexToRemove, 1);
        }
      }
    },

    decrementQuantity: (state, action) => {
      const { productId, variation_product_id } = action.payload;

      // Find the product or variation in the cart
      const existingProduct = state?.products?.find(
        (item) =>
          item?.productId === productId &&
          (variation_product_id
            ? item?.variation_product_id === variation_product_id
            : true)
      );

      if (existingProduct) {
        // Decrement the quantity
        if (existingProduct.quantity > 1) {
          existingProduct.quantity -= 1;

          state.totalQuantity -= 1;
        }
      }
    },

    incrementQuantity: (state, action) => {
      const { productId, variation_product_id, product_quantity } =
        action.payload;

      // Find the product or variation in the cart
      const existingProduct = state?.products?.find(
        (item) =>
          item?.productId === productId &&
          (variation_product_id
            ? item?.variation_product_id === variation_product_id
            : true)
      );

      if (existingProduct) {
        if (existingProduct.quantity < product_quantity) {
          // Increment the quantity if within stock
          existingProduct.quantity += 1;
          state.totalQuantity += 1;
        } else {
          console.error("Stock limit reached");
          // Optionally handle stock limit exceeded (e.g., show a toast message)
        }
      }
    },

    updateQuantity: (state, action) => {
      const { productId, variation_product_id, quantity, product_quantity } =
        action.payload;

      // Find the product or variation in the cart
      const existingProduct = state?.products?.find(
        (item) =>
          item?.productId === productId &&
          (variation_product_id
            ? item?.variation_product_id === variation_product_id
            : true)
      );

      if (existingProduct) {
        // Update the quantity and ensure it's within stock limits
        if (quantity >= 1 && quantity <= product_quantity) {
          // Update the product quantity
          existingProduct.quantity = quantity;
          state.totalQuantity = state.products.reduce(
            (total, item) => total + item.quantity,
            0
          );
        }
      }

      // if (existingProduct) {
      //   existingProduct.quantity = quantity; // Allow any quantity input
      // }
    },

    allRemoveFromCart: (state) => {
      state.products = [];
      state.totalPrice = 0;
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
} = cartSlice.actions;

export default cartSlice.reducer;
