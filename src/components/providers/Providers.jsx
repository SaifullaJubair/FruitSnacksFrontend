"use client";
import { store } from "@/redux/store";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadCartFromDB } from "@/utils/cartSync";
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

const Providers = ({ children }) => {
  return (
    <Provider store={store}>
      <CartLoader />
      {children}
    </Provider>
  );
};

export default Providers;
