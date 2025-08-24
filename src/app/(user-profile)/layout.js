import { getMenu } from "@/components/lib/getMenu";
import Footer from "@/components/shared/footer/Footer";
import BottomNavbar from "@/components/shared/navbar/BottomNavbar";
import SecondNavbar from "@/components/shared/navbar/SecondNavbar";
import TopNavbar from "@/components/shared/navbar/TopNavbar";
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
      <div className="sticky top-0 z-30 bg-white">
        <SecondNavbar menuData={menuData} />
        <MobileNavBarUserDashBoard />
      </div>
      <div>{children}</div>
      <Footer />
    </div>
  );
};

export default MainLayout;
