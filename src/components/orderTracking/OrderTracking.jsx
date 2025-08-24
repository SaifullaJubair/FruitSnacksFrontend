"use client";
import { useState } from "react";
import { images } from "../utils/ImageImport";
import MyOrderTracking from "./MyOrderTracking";
import OrderTrackingForm from "./OrderTrackingForm";

const OrderTracking = () => {
  const [order, setOrder] = useState();

  return (
    <>
      {order?.data ? (
        <div>
          <MyOrderTracking
            order={order?.data?.order_info}
            productOrder={order?.data?.order_products}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 my-6 p-5 bg-white border  ">
          <div className="flex items-center justify-center">
            <img
              src={images.trackingImg}
              height={500}
              width={500}
              alt="tracking-logo"
              className="  "
              loading="lazy"
            />
          </div>
          <div className="mt-6">
            <article>
              <h4 className="font-semibold">Track Your Order Status</h4>
              <p>
                To track your order Status please enter your Invoice No in the
                box below and press &quot;Track&ldquo; button. This was given to
                you on your receipt and in the confirmation phone you should
                have received.
              </p>
            </article>
            <OrderTrackingForm setOrder={setOrder} />
          </div>
        </div>
      )}
    </>
  );
};

export default OrderTracking;
