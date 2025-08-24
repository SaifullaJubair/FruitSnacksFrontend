import TopNavbar from "@/components/shared/navbar/TopNavbar";
import SecondNavbar from "@/components/shared/navbar/SecondNavbar";
import BottomNavbar from "@/components/shared/navbar/BottomNavbar";
import Footer from "@/components/shared/footer/Footer";
import { getMenu } from "@/components/lib/getMenu";
import dynamic from "next/dynamic";

// import MobileNavBarUserDashBoard from "@/components/shared/navbar/MobileNavBarUserDashBoard";
const MobileNavBarUserDashBoard = dynamic(
  () => import("@/components/shared/navbar/MobileNavBarUserDashBoard"),
  { ssr: false } // Ensures it only loads on the client side
);

const MainLayout = async ({ children }) => {
  const menuData = await getMenu();
  return (
    <div>
      {/* <TopNavbar /> */}
      <div className="sticky top-0 z-30 bg-white shadow-md">
        <SecondNavbar menuData={menuData} />
        {/* <BottomNavbar menuData={menuData} /> */}
      </div>
      <div className="min-h-screen">{children}</div>
      <MobileNavBarUserDashBoard />
      <Footer menuData={menuData} />
    </div>
  );
};

export default MainLayout;
