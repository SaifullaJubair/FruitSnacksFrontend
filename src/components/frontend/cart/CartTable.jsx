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
  products,
  couponData,
  shopProduct,
  adjustedPrices,
  onRemoveFromCache,
}) => {
  const dispatch = useDispatch();
  const { data: settingsData, isLoading: siteSettingLoading } =
    useGetSettingData();
  const currencySymbol = settingsData?.data[0];

  const getMaxStock = (product) =>
    product?.variations?._id
      ? product?.variations?.variation_quantity
      : product?.product_quantity;

  const getQuantity = (product) =>
    products?.find(
      (item) =>
        item?.productId === product?._id &&
        (product?.variations?._id
          ? item?.variation_product_id === product?.variations?._id
          : !item?.variation_product_id),
    )?.quantity || 1;

  const calculateProductSubtotal = (product) => {
    const priceKey = product?.variations?._id
      ? `${product._id}-${product.variations._id}`
      : product._id;
    const price =
      couponData?.coupon_product_type === "specific" &&
      couponData?.coupon_specific_product?.some(
        (item) => item?.product_id === product?._id,
      )
        ? adjustedPrices[priceKey]
        : productPrice(product);
    return price * getQuantity(product);
  };

  const handleIncrement = (product) => {
    const maxStock = getMaxStock(product);
    if (getQuantity(product) >= maxStock) return;
    dispatch(
      incrementQuantity({
        productId: product?._id,
        variation_product_id: product?.variations?._id || null,
        maxStock,
      }),
    );
  };

  const handleDecrement = (product) => {
    if (getQuantity(product) <= 1) return;
    dispatch(
      decrementQuantity({
        productId: product?._id,
        variation_product_id: product?.variations?._id || null,
      }),
    );
  };

  const handleQuantityInput = (e, product) => {
    const maxStock = getMaxStock(product);
    const raw = parseInt(e.target.value);
    const clamped = isNaN(raw) ? 1 : Math.max(1, Math.min(raw, maxStock));
    dispatch(
      updateQuantity({
        productId: product?._id,
        variation_product_id: product?.variations?._id || null,
        quantity: clamped,
        maxStock,
      }),
    );
  };

  const handleRemove = (product) => {
    // Redux থেকে সরাও
    dispatch(
      removeFromCart({
        productId: product?._id,
        variation_product_id: product?.variations?._id || null,
      }),
    );
    // Query cache থেকেও সরাও — reload নেই
    onRemoveFromCache?.(product?._id, product?.variations?._id);
  };

  return (
    <PhotoProvider>
      <table className="min-w-full text-sm">
        <thead className="border-b pb-1">
          <tr className="text-gray-900">
            <td className="whitespace-nowrap p-4">#</td>
            <td className="whitespace-nowrap p-4">Image</td>
            <td className="whitespace-nowrap p-4">Product Info</td>
            <td className="whitespace-nowrap p-4">Quantity</td>
            <td className="whitespace-nowrap p-4">Unit Price</td>
            <td className="whitespace-nowrap p-4">SubTotal</td>
            <td className="whitespace-nowrap p-4">Remove</td>
          </tr>
        </thead>
        <tbody className="divide-gray-200">
          {(Array.isArray(shopProduct) ? shopProduct : []).map(
            (product, index) => {
              const currentQty = getQuantity(product);
              const maxStock = getMaxStock(product);
              const isAtMin = currentQty <= 1;
              const isAtMax = currentQty >= maxStock;

              return (
                <tr
                  className={`divide-y divide-gray-100 space-y-2 py-2 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  key={`${product._id}-${product?.variations?._id || "no-var"}`}
                >
                  <td className="whitespace-nowrap p-4">{index + 1}</td>

                  <td>
                    <PhotoView src={product?.main_image}>
                      <Image
                        src={product?.main_image}
                        className="w-20 h-[72px] cursor-zoom-in border"
                        height={100}
                        width={100}
                        alt={product?.product_name}
                      />
                    </PhotoView>
                  </td>

                  <td className="min-w-[260px] py-2.5 text-gray-700 px-4">
                    <div className="mt-1">
                      <p className="mb-1">
                        <Link
                          href={`/products/${product?.product_slug}`}
                          className="text-text-semiLight font-medium hover:text-primary line-clamp-2"
                        >
                          {product?.product_name}
                        </Link>
                      </p>
                      <div className="text-text-Lighter">
                        {product?.brand_id?.brand_name && (
                          <p>Brand: {product?.brand_id?.brand_name}</p>
                        )}
                        {product?.is_variation && (
                          <p>
                            Variation: {product?.variations?.variation_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="whitespace-nowrap py-1.5 font-medium text-gray-700 px-4">
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => handleDecrement(product)}
                        disabled={isAtMin}
                        className={`border px-2.5 py-1 transition-all duration-200
                        ${
                          isAtMin
                            ? "border-gray-200 text-gray-300 cursor-not-allowed"
                            : "border-primary-200 text-primary-300 hover:bg-primary-300 hover:text-white cursor-pointer"
                        }`}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="border mx-2 border-primary-200 max-w-[70px] text-center p-2 outline-primary-300"
                        value={currentQty}
                        min={1}
                        max={maxStock}
                        onChange={(e) => handleQuantityInput(e, product)}
                      />
                      <button
                        type="button"
                        onClick={() => handleIncrement(product)}
                        disabled={isAtMax}
                        className={`border px-2.5 py-1 transition-all duration-200
                        ${
                          isAtMax
                            ? "border-gray-200 text-gray-300 cursor-not-allowed"
                            : "border-primary-200 text-primary-300 hover:bg-primary-300 hover:text-white cursor-pointer"
                        }`}
                      >
                        +
                      </button>
                    </div>
                    {isAtMax && (
                      <p className="text-xs text-orange-500 mt-1">
                        Max stock reached
                      </p>
                    )}
                  </td>

                  <td className="whitespace-nowrap py-2.5 font-medium text-gray-700 px-4">
                    {couponData?.coupon_product_type === "specific" &&
                    couponData?.coupon_specific_product?.some(
                      (item) => item?.product_id === product?._id,
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
                        <span className="text-base font-bold">
                          {!siteSettingLoading &&
                            currencySymbol?.currency_symbol}
                        </span>{" "}
                        {productPrice(product)}
                      </p>
                    )}
                  </td>

                  <td className="whitespace-nowrap py-2.5 font-medium text-gray-700 px-4">
                    <p className="font-thin text-text-Lighter mb-2 text-xl">
                      <span className="text-base font-bold">
                        {!siteSettingLoading && currencySymbol?.currency_symbol}
                      </span>{" "}
                      {calculateProductSubtotal(product)}
                    </p>
                  </td>

                  <td className="whitespace-nowrap py-2.5 font-medium text-gray-700 px-4">
                    <button type="button" onClick={() => handleRemove(product)}>
                      <MdDeleteForever
                        size={25}
                        className="cursor-pointer text-red-500 hover:text-red-300"
                      />
                    </button>
                  </td>
                </tr>
              );
            },
          )}
        </tbody>
      </table>
    </PhotoProvider>
  );
};

export default CartTable;
