import { getMenu } from "@/components/lib/getMenu";
import Footer from "@/components/shared/footer/Footer";
import SecondNavbar from "@/components/shared/navbar/SecondNavbar";
import MobileNavBarUserDashBoard from "@/components/shared/navbar/MobileNavBarUserDashBoardClient";

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
