import { baseApi } from "./api/baseApi";
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./feature/cart/cartSlice";
import { cartLocalStorageMiddleware } from "./cartLocalstorageMiddleware";

// SSR safe — server এ localStorage নেই
const cartLoadState = () => {
  if (typeof window === "undefined") return undefined;
  try {
    const serializedCart = localStorage.getItem("cart");
    if (!serializedCart) return undefined;
    return JSON.parse(serializedCart);
  } catch (error) {
    return undefined;
  }
};

const cartPreloadedState = cartLoadState();

// Configure the Redux store
export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      baseApi.middleware,
      cartLocalStorageMiddleware,
    ),
  preloadedState: {
    cart: cartPreloadedState,
  },
});
