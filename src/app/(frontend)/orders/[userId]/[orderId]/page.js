import Contain from "@/components/common/Contain";
import OrderInvoice from "@/components/frontend/orders/orderInvoice/OrderInvoice";

const OrderInvoicePage = () => {
  return (
    <div className="bg-[#F4F4F4]/40 min-h-screen">
      <Contain>
        <OrderInvoice />
      </Contain>
    </div>
  );
};

export default OrderInvoicePage;
