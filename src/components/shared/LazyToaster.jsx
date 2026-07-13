"use client";

import dynamic from "next/dynamic";

// ReactToastify.css used to be imported by the root layout, which made it a
// render-blocking <link> on every route — 16 KiB the browser had to fetch and
// parse before it could paint anything, for a container that draws nothing until
// somebody adds to a cart. Both the component and its stylesheet now load after
// the page has painted.
//
// ssr:false is deliberate: toasts are triggered by clicks, so there is nothing
// to server-render, and it keeps the container out of the hydration payload.
const Toaster = dynamic(() => import("./Toaster"), { ssr: false });

export default function LazyToaster() {
  return <Toaster />;
}
