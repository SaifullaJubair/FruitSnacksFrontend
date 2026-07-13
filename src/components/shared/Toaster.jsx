"use client";

// The stylesheet lives here, next to its only consumer, so it is fetched with
// this lazily-loaded chunk instead of blocking the first paint of every route.
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Toaster() {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={1500}
      transition={Slide}
      closeOnClick
    />
  );
}
