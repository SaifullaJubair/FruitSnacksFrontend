import Contain from "@/components/common/Contain";
import OfferOrdersInvoice from "@/components/frontend/offerOrders/OfferOrdersInvoice";

const OfferOrderInvoicePage = () => {
  return (
    <div className="bg-[#F4F4F4]/40 min-h-screen">
      <Contain>
        {" "}
        <OfferOrdersInvoice />
      </Contain>
    </div>
  );
};

export default OfferOrderInvoicePage;
