"use client";

import dynamic from "next/dynamic";

// Client-only wrapper for the user-dashboard mobile navbar. Next.js 16 forbids
// `dynamic(..., { ssr: false })` inside a Server Component, so the ssr:false
// dynamic import lives here in a Client Component and the layout (a Server
// Component that awaits getMenu) just renders this wrapper.
const MobileNavBarUserDashBoard = dynamic(
  () => import("./MobileNavBarUserDashBoard"),
  { ssr: false },
);

const MobileNavBarUserDashBoardClient = () => <MobileNavBarUserDashBoard />;

export default MobileNavBarUserDashBoardClient;
