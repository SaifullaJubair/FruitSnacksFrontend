import Link from "next/link";
import Image from "next/image";
import {
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
  updateQuantity,
} from "@/redux/feature/cart/cartSlice";
import { useDispatch } from "react-redux";
import { MdDeleteForever } from "react-icons/md";
import { productPrice } from "@/utils/helper";
import useGetSettingData from "@/components/lib/getSettingData";
import { PhotoProvider, PhotoView } from "react-photo-view";
const CartTable = ({
  refetch,
  products,
  couponData,
  shopProduct,
  adjustedPrices,
}) => {
  const calculateProductSubtotal = (product) => {
    // Create the same key used in useCartCalculations
    const priceKey = product?.variations?._id
      ? `${product._id}-${product.variations._id}`
      : product._id;

    const price =
      couponData?.coupon_product_type === "specific" &&
      couponData?.coupon_specific_product?.some(
        (item) => item?.product_id === product?._id
      )
        ? adjustedPrices[priceKey]
        : productPrice(product);


    const quantity =
      products?.find(
        (item) =>
          item?.productId === product?._id &&
          (product?.variations?._id
            ? item?.variation_product_id === product?.variations?._id
            : true)
      )?.quantity || 1;

    return price * quantity;
  };
   
  
  const dispatch = useDispatch();
  const handleIncrementQuantity = (
    productId,
    variation_product_id,
    product_quantity
  ) => {
    dispatch(
      incrementQuantity({ productId, variation_product_id, product_quantity })
    );
  };

  const handleDecrementQuantity = (productId, variation_product_id) => {
    dispatch(decrementQuantity({ productId, variation_product_id }));
  };
  const handleQuantityInputChange = (
    e,
    productId,
    variation_product_id,
    product_quantity
  ) => {
    let newQuantity = e.target.value || 1;
    dispatch(
      updateQuantity({
        productId,
        variation_product_id,
        quantity: newQuantity,
        product_quantity,
      })
    );
  };
  const handleRemoveFromCart = (
    productId,
    variation_product_id,
    product_quantity
  ) => {
    dispatch(
      removeFromCart({ productId, variation_product_id, product_quantity })
    );
    setTimeout(() => refetch(), 500);
  };
  const { data: settingsData, isLoading: siteSettingLoading } =
    useGetSettingData();

  const currencySymbol = settingsData?.data[0];
  console.log(22, shopProduct);

  return (
    <PhotoProvider>
      <table className="min-w-full text-sm">
        <thead className=" border-b pb-1">
          <tr className="text-gray-900 ">
            <td className="whitespace-nowrap p-4 ">#</td>
            <td className="whitespace-nowrap p-4 ">Image</td>
            <td className="whitespace-nowrap p-4 ">Product Info</td>
            <td className="whitespace-nowrap p-4 ">Quantity</td>
            <td className="whitespace-nowrap p-4 ">Unit Price</td>
            <td className="whitespace-nowrap p-4 ">SubTotal</td>
            <td className="whitespace-nowrap p-4 ">Remove</td>
          </tr>
        </thead>

        <tbody className="divide-gray-200">
          {(Array.isArray(shopProduct) ? shopProduct : [])?.map(
            (product, index) => (
              <tr
                className={`divide-y divide-gray-100 space-y-2 py-2 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
                key={index}
              >
                <td className="whitespace-nowrap p-4 ">
                  {/* <input type="checkbox" id="" name="" value="" /> */}{" "}
                  {index + 1}
                </td>
                <td>
                  <PhotoView src={product?.main_image}>
                    <Image
                      src={product?.main_image}
                      className="w-20 h-[72px]  cursor-zoom-in  border"
                      height={100}
                      width={100}
                      alt=""
                    />
                  </PhotoView>
                </td>
                <td className="min-w-[260px] py-2.5 text-gray-700  px-4  scrollbar-track-gray-200">
                  <div className="mt-1 ">
                    <p className="mb-1">
                      <Link
                        href={`/products/${product?.product_slug}`}
                        className="text-text-semiLight font-medium hover:text-primary line-clamp-2"
                      >
                        {product?.product_name}
                      </Link>
                    </p>
                    <div className="text-text-Lighter items-center">
                      {product?.brand_id?.brand_name && (
                        <p>Brand: {product?.brand_id?.brand_name}</p>
                      )}

                      {product?.is_variation && (
                        <p>Variation: {product?.variations?.variation_name}</p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="whitespace-nowrap py-1.5  font-medium text-gray-700 px-4">
                  <button
                    type="button"
                    className={`border border-primaryVariant-200 px-2.5   text-primaryVariant-300 hover:bg-primaryVariant-300 hover:text-white transition-all duration-300 ease-in-out `}
                    onClick={() => {
                      handleDecrementQuantity(
                        product?._id,
                        product?.variations?._id
                      );
                    }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="border mx-2  border-primaryVariant-200 max-w-[70px] text-center p-2 outline-primaryVariant-300"
                    value={
                      products?.find(
                        (item) =>
                          item?.productId === product?._id &&
                          (product?.variations?._id
                            ? item?.variation_product_id ===
                              product?.variations?._id
                            : true)
                      )?.quantity
                    }
                    onChange={(e) =>
                      handleQuantityInputChange(
                        e,
                        product?._id,
                        product?.variations?._id,
                        product?.variations?._id
                          ? product?.variations?.variation_quantity
                          : product?.product_quantity
                      )
                    }
                  />

                  <button
                    type="button"
                    onClick={() => {
                      handleIncrementQuantity(
                        product?._id,
                        product?.variations?._id,
                        product?.variations?._id
                          ? product?.variations?.variation_quantity
                          : product?.product_quantity
                      );
                    }}
                    className="border border-primaryVariant-200 px-2.5   text-primaryVariant-300 hover:bg-primaryVariant-300 hover:text-white transition-all duration-300 ease-in-out"
                  >
                    +
                  </button>
                </td>
                <td className="whitespace-nowrap py-2.5 font-medium text-gray-700 px-4">
                  {couponData?.coupon_product_type === "specific" &&
                  couponData?.coupon_specific_product?.some(
                    (item) => item?.product_id === product?._id
                  ) ? (
                    <div className="flex items-center gap-2">
                      <p className="font-thin line-through text-text-Lighter mb-2 text-md">
                        <span className="text-base font-bold">
                          {!siteSettingLoading &&
                            currencySymbol?.currency_symbol}
                        </span>
                        {productPrice(product)}
                      </p>
                      <p className="font-thin text-text-Lighter mb-2 text-xl">
                        <span className="text-base font-bold">
                          {!siteSettingLoading &&
                            currencySymbol?.currency_symbol}
                        </span>{" "}
                        {
                          adjustedPrices[
                            product?.variations?._id
                              ? `${product._id}-${product.variations._id}`
                              : product._id
                          ]
                        }
                      </p>
                    </div>
                  ) : (
                    <p className="font-thin text-text-Lighter mb-2 text-xl">
                      <span className="text-base font-bold ">
                        {" "}
                        {!siteSettingLoading && currencySymbol?.currency_symbol}
                      </span>{" "}
                      {productPrice(product)}
                    </p>
                  )}
                </td>
                <td className="whitespace-nowrap py-2.5 font-medium text-gray-700 px-4">
                  <p className="font-thin text-text-Lighter mb-2 text-xl">
                    <span className="text-base font-bold ">
                      {" "}
                      {!siteSettingLoading && currencySymbol?.currency_symbol}
                    </span>{" "}
                    {calculateProductSubtotal(product)}
                  </p>
                </td>

                <td className="whitespace-nowrap py-2.5 font-medium text-gray-700 px-4">
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveFromCart(
                        product?._id,
                        product?.variations?._id,
                        product?.variations?._id
                          ? product?.variations?.variation_quantity
                          : product?.product_quantity
                      )
                    }
                  >
                    <MdDeleteForever
                      size={25}
                      className="cursor-pointer text-red-500 hover:text-red-300"
                    />
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </PhotoProvider>
  );
};

export default CartTable;
