"use client";
import { store } from "@/redux/store";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadCartFromDB } from "@/utils/cartSync";
import { loadWishlistFromDB } from "@/utils/wishlistSync";
import { useUserInfoQuery } from "@/redux/feature/auth/authApi";

const CartLoader = () => {
  const dispatch = useDispatch();
  const { data: userInfo } = useUserInfoQuery();

  useEffect(() => {
    // User logged in থাকলে DB থেকে cart load করো
    if (userInfo?.data?._id) {
      loadCartFromDB(dispatch);
    }
  }, [userInfo?.data?._id, dispatch]);

  return null;
};

// D15 — পরিচিত CartLoader pattern-এর mirror। logged-in user fresh load করলে
// BE থেকে wishlist union-merge করে localStorage-এ বসায়; পরে heart toggle আর
// dashboard remove সরাসরি BE-তেও fire করে (wishlistSync.js-এর remote helpers)।
const WishlistLoader = () => {
  const { data: userInfo } = useUserInfoQuery();

  useEffect(() => {
    if (userInfo?.data?._id) {
      loadWishlistFromDB();
    }
  }, [userInfo?.data?._id]);

  return null;
};

const Providers = ({ children }) => {
  return (
    <Provider store={store}>
      <CartLoader />
      <WishlistLoader />
      {children}
    </Provider>
  );
};

export default Providers;
