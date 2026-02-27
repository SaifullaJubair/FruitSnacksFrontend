"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { HiMinus, HiOutlinePlus } from "react-icons/hi";
import { BsCart } from "react-icons/bs";
import { TbShoppingCartOff } from "react-icons/tb";
import { IoClose } from "react-icons/io5";
import { FiArrowUpRight } from "react-icons/fi";

import { BASE_URL } from "@/components/utils/baseURL";
import { addToCart } from "@/redux/feature/cart/cartSlice";
import { calculatePrice, isHexColor, singleProductPrice } from "@/utils/helper";
import useGetSettingData from "@/components/lib/getSettingData";

// Overlay — modal এর বাইরে click করলে বন্ধ হবে
const Overlay = ({ onClick }) => (
  <div className="fixed inset-0 bg-black/50 z-40" onClick={onClick} />
);

const QuickViewModal = ({ product: listProduct, onClose }) => {
  const dispatch = useDispatch();
  const cartProducts = useSelector((state) => state.cart.products);
  const { data: settingsData } = useGetSettingData();
  const currencySymbol = settingsData?.data[0]?.currency_symbol;

  // Full product details (slug দিয়ে fetch করব)
  const [product, setProduct] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Variation & quantity state
  const [selectedVariations, setSelectedVariations] = useState({});
  const [variationProduct, setVariationProduct] = useState(null);
  const [productPrice, setProductPrice] = useState(null);
  const [lineThoughPrice, setLineThoughPrice] = useState(null);
  const [stock, setStock] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);

  // Full product fetch করো
  useEffect(() => {
    if (!listProduct?.product_slug) return;
    setFetchLoading(true);
    fetch(`${BASE_URL}/product/${listProduct.product_slug}`)
      .then((r) => r.json())
      .then((data) => {
        const p = data?.data;
        setProduct(p);

        // Initial price & stock set করো
        if (p?.is_variation && p?.variations?.length > 0) {
          const firstVariation = p.variations[0];
          setVariationProduct(firstVariation);
          setStock(firstVariation.variation_quantity);
          const price =
            firstVariation.variation_discount_price ||
            firstVariation.variation_price;
          setProductPrice(price);
          if (firstVariation.variation_discount_price) {
            setLineThoughPrice(firstVariation.variation_price);
          }
          setActiveImage(firstVariation.variation_image || p.main_image);

          // Initial variation selections
          if (p.attributes_details?.length > 0) {
            const initial = {};
            p.attributes_details.forEach((attr) => {
              if (attr.attribute_values?.length > 0) {
                initial[attr.attribute_name] = attr.attribute_values[0];
              }
            });
            setSelectedVariations(initial);
          }
        } else {
          setStock(p?.product_quantity || 0);
          setProductPrice(singleProductPrice(p));
          setActiveImage(p?.main_image);
          if (p?.product_discount_price) {
            setLineThoughPrice(p.product_price);
          }
        }
      })
      .catch(() => toast.error("Failed to load product"))
      .finally(() => setFetchLoading(false));
  }, [listProduct?.product_slug]);

  // Variation select করলে price & stock update করো
  const handleSelectVariation = useCallback(
    (value, attributeName) => {
      if (!product) return;
      const newVariations = { ...selectedVariations, [attributeName]: value };
      setSelectedVariations(newVariations);

      // Slug generate করো matching variation খুঁজতে
      const slug = Object.values(newVariations)
        .map((v) => v.attribute_value_name)
        .join("-");

      const found = product.variations?.find((v) => v.variation_name === slug);
      if (found) {
        setVariationProduct(found);
        setStock(found.variation_quantity);
        setQuantity(1);
        setActiveImage(found.variation_image || product.main_image);

        let price = found.variation_discount_price || found.variation_price;

        // Flash sale check
        if (product?.flash_sale_details?.flash_sale_product) {
          const fp = product.flash_sale_details.flash_sale_product;
          if (fp?.flash_price_type) {
            price = calculatePrice(
              price,
              fp.flash_sale_product_price,
              fp.flash_price_type,
            );
          }
          setLineThoughPrice(found.variation_price);
        } else if (product?.campaign_details?.campaign_product) {
          const cp = product.campaign_details.campaign_product;
          if (cp?.campaign_price_type) {
            price = calculatePrice(
              price,
              cp.campaign_product_price,
              cp.campaign_price_type,
            );
          }
          setLineThoughPrice(found.variation_price);
        } else {
          setLineThoughPrice(
            found.variation_discount_price ? found.variation_price : null,
          );
        }
        setProductPrice(price);
      }
    },
    [product, selectedVariations],
  );

  // Add to cart
  const handleAddToCart = useCallback(() => {
    if (!product) return;

    // Variation product হলে variation select করা আছে কিনা check
    if (product.is_variation && !variationProduct) {
      toast.error("Please select a variation");
      return;
    }

    const alreadyInCart = cartProducts.some((item) => {
      if (variationProduct) {
        return (
          item.productId === product._id &&
          item.variation_product_id === variationProduct._id
        );
      }
      return item.productId === product._id && !item.variation_product_id;
    });

    if (alreadyInCart) {
      toast.error("Already in cart!", { autoClose: 1500 });
      return;
    }

    dispatch(
      addToCart({
        productId: product._id,
        variation_product_id: variationProduct?._id || null,
        quantity,
      }),
    );
    toast.success("Added to cart!", { autoClose: 1500 });
    onClose();
  }, [product, variationProduct, cartProducts, quantity, dispatch, onClose]);

  // Quantity handlers
  const handleIncrement = () => {
    if (quantity < stock) setQuantity((q) => q + 1);
    else toast.error("Stock limit reached");
  };
  const handleDecrement = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  // ESC key দিয়ে বন্ধ করো
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      <Overlay onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 bg-white rounded-full p-1 shadow hover:bg-gray-100"
          >
            <IoClose size={22} />
          </button>

          {fetchLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !product ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Product not found
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
              {/* Left — Image */}
              <div className="relative aspect-square bg-gray-50">
                <Image
                  fill
                  src={activeImage || product.main_image}
                  alt={product.product_name}
                  className="object-cover"
                />
              </div>

              {/* Right — Details */}
              <div className="p-5 flex flex-col gap-3">
                {/* Name */}
                <h2 className="text-lg font-semibold text-gray-800 leading-tight">
                  {product.product_name}
                </h2>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    {currencySymbol}
                    {productPrice}
                  </span>
                  {lineThoughPrice && (
                    <span className="text-sm line-through text-gray-400">
                      {currencySymbol}
                      {lineThoughPrice}
                    </span>
                  )}
                </div>

                {/* Stock */}
                {stock > 0 ? (
                  <p className="text-sm text-green-600 font-medium">
                    In Stock: {stock}
                  </p>
                ) : (
                  <p className="text-sm text-red-500 font-medium">
                    Out of Stock
                  </p>
                )}

                {/* Variations */}
                {product.is_variation &&
                  product.attributes_details?.map((attr, i) => (
                    <div key={i}>
                      <p className="text-sm text-gray-600 mb-1.5">
                        {attr.attribute_name}:{" "}
                        <span className="text-primary font-medium">
                          {selectedVariations[attr.attribute_name]
                            ?.attribute_value_name || "Select"}
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {attr.attribute_values?.map((val) => {
                          const isSelected =
                            selectedVariations[attr.attribute_name]
                              ?.attribute_value_name ===
                            val.attribute_value_name;
                          const isColor = isHexColor(val.attribute_value_code);

                          return (
                            <button
                              key={val._id}
                              type="button"
                              onClick={() =>
                                handleSelectVariation(val, attr.attribute_name)
                              }
                              title={val.attribute_value_name}
                              className={`border transition-all duration-200
                                ${isColor ? "w-7 h-7 rounded-full" : "px-2.5 py-1 text-xs"}
                                ${
                                  isSelected
                                    ? "border-primary bg-primary text-white"
                                    : "border-gray-300 hover:border-primary text-gray-700 hover:text-primary"
                                }`}
                              style={{
                                backgroundColor:
                                  isColor && !isSelected
                                    ? val.attribute_value_code
                                    : undefined,
                              }}
                            >
                              {!isColor && val.attribute_value_name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                {/* Quantity */}
                {stock > 0 && (
                  <div className="flex items-center gap-0">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      className="px-3 py-2 border border-gray-200 bg-gray-50 hover:bg-gray-100"
                    >
                      <HiMinus className="text-gray-600" />
                    </button>
                    <input
                      type="number"
                      readOnly
                      value={quantity}
                      className="w-14 text-center border-y border-gray-200 py-2 outline-none text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleIncrement}
                      className="px-3 py-2 border border-gray-200 bg-gray-50 hover:bg-gray-100"
                    >
                      <HiOutlinePlus className="text-gray-600" />
                    </button>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col gap-2 mt-1">
                  {stock <= 0 ? (
                    <button
                      disabled
                      className="w-full py-2.5 flex items-center justify-center gap-2 bg-gray-200 text-gray-400 cursor-not-allowed text-sm"
                    >
                      <TbShoppingCartOff />
                      Out of Stock
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="w-full py-2.5 flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 transition text-sm font-medium"
                    >
                      <BsCart />
                      Add to Cart
                    </button>
                  )}

                  <Link
                    href={`/products/${product.product_slug}`}
                    className="w-full py-2.5 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:border-primary hover:text-primary transition text-sm"
                    onClick={onClose}
                  >
                    View Full Details
                    <FiArrowUpRight />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default QuickViewModal;
