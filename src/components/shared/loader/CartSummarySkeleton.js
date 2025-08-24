import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CartSummarySkeleton = () => {
  return (
    <div className="mt-6 bg-white shadow-lg p-4">
      {/* Location */}
      <div className="flex justify-between items-center flex-wrap">
        <p className="text-text-Lightest">Location</p>
        <Skeleton width={120} height={20} />
      </div>

      <hr className="mt-2" />

      {/* Subtotal */}
      <div className="flex justify-between mt-4">
        <p className="text-text-Lightest">Subtotal</p>
        <Skeleton width={80} height={20} />
      </div>

      {/* <div className="mt-2 flex">
        <Skeleton width={"100%"} height={40} />
        <Skeleton width={80} height={40} className="ml-2" />
      </div> */}

      <hr className="mt-2" />

      {/* Total Discount */}
      <div className="flex justify-between mt-4">
        <p className="text-text-Lightest">Total Discount</p>
        <Skeleton width={80} height={20} />
      </div>

      <hr className="mt-2" />

      {/* Shipping */}
      <div className="flex justify-between mt-4">
        <p className="text-text-Lightest">Shipping</p>
        <Skeleton width={80} height={20} />
      </div>

      {/* Total */}
      <div className="flex justify-between mt-4">
        <p className="text-text-Lightest">Total</p>
        <Skeleton width={80} height={20} />
      </div>

      <hr className="mt-2" />

      {/* Checkout Button */}
      <div className="flex my-4 mx-auto w-full">
        <Skeleton width={200} height={45} />
      </div>
    </div>
  );
};

export default CartSummarySkeleton;
