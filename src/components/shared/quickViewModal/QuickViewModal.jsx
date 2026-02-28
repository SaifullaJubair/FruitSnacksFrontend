"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { HiMinus, HiOutlinePlus } from "react-icons/hi";
import { BsCart, BsHeart, BsHeartFill, BsShare } from "react-icons/bs";
import { TbShoppingCartOff } from "react-icons/tb";
import { IoClose } from "react-icons/io5";
import { FiArrowUpRight, FiCheck } from "react-icons/fi";
import { MdOutlineLocalShipping } from "react-icons/md";
import { RiSecurePaymentLine } from "react-icons/ri";
import { TbTruckReturn } from "react-icons/tb";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Thumbs } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/thumbs";

import { BASE_URL } from "@/components/utils/baseURL";
import { addToCart } from "@/redux/feature/cart/cartSlice";
import { calculatePrice, isHexColor, singleProductPrice } from "@/utils/helper";
import useGetSettingData from "@/components/lib/getSettingData";

// ✅ Meta Pixel
import useMetaPixel, { generateEventId } from "@/utils/metaPixel/useMetaPixel";
import { sendServerEvent } from "@/utils/metaPixel/metaServerEvent";
import { useUserInfoQuery } from "@/redux/feature/auth/authApi";

const Overlay = ({ onClick }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
    onClick={onClick}
  />
);

const QuickViewModal = ({ product: listProduct, onClose }) => {
  const dispatch = useDispatch();
  const cartProducts = useSelector((state) => state.cart.products);
  const { data: settingsData } = useGetSettingData();
  const currencySymbol = settingsData?.data[0]?.currency_symbol;
  const { trackAddToCart, trackViewContent, trackAddToWishlist } =
    useMetaPixel();
  const { data: userInfo } = useUserInfoQuery();
  const modalRef = useRef(null);

  // Full product details
  const [product, setProduct] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Variation & quantity state
  const [selectedVariations, setSelectedVariations] = useState({});
  const [variationProduct, setVariationProduct] = useState(null);
  const [productPrice, setProductPrice] = useState(null);
  const [lineThoughPrice, setLineThoughPrice] = useState(null);
  const [stock, setStock] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  // Gallery images
  const [galleryImages, setGalleryImages] = useState([]);

  // Check if product is in cart
  useEffect(() => {
    if (!product) return;

    const inCart = cartProducts.some((item) => {
      if (variationProduct) {
        return (
          item.productId === product._id &&
          item.variation_product_id === variationProduct._id
        );
      }
      return item.productId === product._id && !item.variation_product_id;
    });

    setIsInCart(inCart);
  }, [product, variationProduct, cartProducts]);

  // Full product fetch
  useEffect(() => {
    if (!listProduct?.product_slug) return;

    setFetchLoading(true);
    setFetchError(false);

    fetch(`${BASE_URL}/product/${listProduct.product_slug}`)
      .then((r) => {
        if (!r.ok) {
          throw new Error("Network response was not ok");
        }
        return r.json();
      })
      .then((data) => {
        const p = data?.data;
        if (!p) {
          throw new Error("Product data not found");
        }

        setProduct(p);
        setFetchError(false);

        // Setup gallery images with all available images
        const images = [p?.main_image].filter(Boolean);

        // Add other images
        if (p?.other_images?.length > 0) {
          p.other_images.forEach((img) => {
            if (img.other_image && !images.includes(img.other_image)) {
              images.push(img.other_image);
            }
          });
        }

        // Add variation images
        if (p?.is_variation && p?.variations?.length > 0) {
          p.variations.forEach((v) => {
            if (v.variation_image && !images.includes(v.variation_image)) {
              images.push(v.variation_image);
            }
          });
        }

        setGalleryImages(images.filter(Boolean));

        // ✅ ViewContent event
        const eventId = generateEventId();
        trackViewContent(p, eventId);
        sendServerEvent({
          event_name: "ViewContent",
          event_id: eventId,
          user_data: {
            ph: userInfo?.data?.user_phone,
            fn: userInfo?.data?.user_name,
            external_id: userInfo?.data?._id,
          },
          custom_data: {
            content_ids: [p?._id],
            content_name: p?.product_name,
            content_type: "product",
            currency: "BDT",
            value: p?.product_discount_price || p?.product_price,
          },
        });

        // Initial price & stock set
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

        // Check wishlist status (after setting product and variation)
        try {
          const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
          if (p?.is_variation && p?.variations?.length > 0) {
            const firstVariation = p.variations[0];
            const variationInWishlist = wishlist.some(
              (item) =>
                item.productId === p?._id &&
                item.variation_product_id === firstVariation._id,
            );
            setIsWishlisted(variationInWishlist);
          } else {
            const isInWishlist = wishlist.some(
              (item) => item.productId === p?._id && !item.variation_product_id,
            );
            setIsWishlisted(isInWishlist);
          }
        } catch (error) {
          console.error("Error reading wishlist:", error);
        }
      })
      .catch((error) => {
        console.error("Error fetching product:", error);
        setFetchError(true);
        toast.error("Failed to load product. Please try again.");
      })
      .finally(() => setFetchLoading(false));
  }, [listProduct?.product_slug, trackViewContent, userInfo]);

  // Variation select
  const handleSelectVariation = useCallback(
    (value, attributeName) => {
      if (!product) return;

      const newVariations = { ...selectedVariations, [attributeName]: value };
      setSelectedVariations(newVariations);

      const slug = Object.values(newVariations)
        .map((v) => v.attribute_value_name)
        .join("-");

      const found = product.variations?.find((v) => v.variation_name === slug);
      if (found) {
        setVariationProduct(found);
        setStock(found.variation_quantity);
        setQuantity(1);
        setActiveImage(found.variation_image || product.main_image);

        // Update active image index in gallery
        const imageIndex = galleryImages.findIndex(
          (img) => img === (found.variation_image || product.main_image),
        );
        if (imageIndex !== -1) setActiveImageIndex(imageIndex);

        let price = found.variation_discount_price || found.variation_price;
        if (product?.flash_sale_details?.flash_sale_product) {
          const fp = product.flash_sale_details.flash_sale_product;
          if (fp?.flash_price_type)
            price = calculatePrice(
              price,
              fp.flash_sale_product_price,
              fp.flash_price_type,
            );
          setLineThoughPrice(found.variation_price);
        } else if (product?.campaign_details?.campaign_product) {
          const cp = product.campaign_details.campaign_product;
          if (cp?.campaign_price_type)
            price = calculatePrice(
              price,
              cp.campaign_product_price,
              cp.campaign_price_type,
            );
          setLineThoughPrice(found.variation_price);
        } else {
          setLineThoughPrice(
            found.variation_discount_price ? found.variation_price : null,
          );
        }
        setProductPrice(price);

        // Check wishlist status for this variation
        try {
          const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
          const isInWishlist = wishlist.some(
            (item) =>
              item.productId === product._id &&
              item.variation_product_id === found._id,
          );
          setIsWishlisted(isInWishlist);
        } catch (error) {
          console.error("Error reading wishlist:", error);
        }
      }
    },
    [product, selectedVariations, galleryImages],
  );

  // Add to cart
  const handleAddToCart = useCallback(() => {
    if (!product) return;

    if (product.is_variation && !variationProduct) {
      toast.error("Please select a variation");
      return;
    }

    if (isInCart) {
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

    // Success animation
    setAddedToCart(true);
    toast.success("Added to cart!", { autoClose: 1500 });
    setTimeout(() => setAddedToCart(false), 1500);

    // ✅ AddToCart Meta Pixel event
    const eventId = generateEventId();
    trackAddToCart(product, variationProduct, quantity, eventId);
    sendServerEvent({
      event_name: "AddToCart",
      event_id: eventId,
      user_data: {
        ph: userInfo?.data?.user_phone,
        fn: userInfo?.data?.user_name,
        external_id: userInfo?.data?._id,
      },
      custom_data: {
        content_ids: [variationProduct?._id || product._id],
        content_name: product.product_name,
        content_type: "product",
        currency: "BDT",
        value: productPrice * quantity,
        num_items: quantity,
      },
    });
  }, [
    product,
    variationProduct,
    quantity,
    dispatch,
    trackAddToCart,
    userInfo,
    productPrice,
    isInCart,
  ]);

  // Wishlist handler
  const handleWishlist = useCallback(() => {
    const wishlistItem = {
      productId: product._id,
      variation_product_id: variationProduct?._id || null,
    };

    let wishlist = [];
    try {
      wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    } catch (error) {
      console.error("Error reading wishlist:", error);
    }

    const exists = wishlist.some(
      (item) =>
        item.productId === product._id &&
        item.variation_product_id === (variationProduct?._id || null),
    );

    if (exists) {
      wishlist = wishlist.filter(
        (item) =>
          !(
            item.productId === product._id &&
            item.variation_product_id === (variationProduct?._id || null)
          ),
      );
      setIsWishlisted(false);
      toast.error("Removed from wishlist", { autoClose: 1500 });
    } else {
      wishlist.push(wishlistItem);
      setIsWishlisted(true);
      toast.success("Added to wishlist", { autoClose: 1500 });

      // ✅ AddToWishlist Meta Pixel event
      const eventId = generateEventId();
      trackAddToWishlist(product, variationProduct, eventId);
      sendServerEvent({
        event_name: "AddToWishlist",
        event_id: eventId,
        user_data: {
          ph: userInfo?.data?.user_phone,
          fn: userInfo?.data?.user_name,
          external_id: userInfo?.data?._id,
        },
        custom_data: {
          content_ids: [variationProduct?._id || product._id],
          content_name: product.product_name,
          content_type: "product",
          currency: "BDT",
          value: productPrice,
        },
      });
    }

    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    window.dispatchEvent(new Event("localStorageUpdated"));
  }, [product, variationProduct, productPrice, trackAddToWishlist, userInfo]);

  // Quantity handlers
  const handleIncrement = () => {
    if (quantity < stock) setQuantity((q) => q + 1);
    else toast.error("Stock limit reached");
  };
  const handleDecrement = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // ESC key
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

  // Render stars for rating
  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <span key={i} className="text-yellow-400">
            ★
          </span>,
        );
      } else if (hasHalfStar && i === fullStars + 1) {
        stars.push(
          <span key={i} className="text-yellow-400">
            ½
          </span>,
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-300">
            ★
          </span>,
        );
      }
    }
    return stars;
  };

  return (
    <AnimatePresence>
      <Overlay onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        style={{ overscrollBehavior: "contain" }}
      >
        <motion.div
          ref={modalRef}
          className="bg-white w-full max-w-lg md:max-w-3xl lg:max-w-4xl max-h-[80vh] lg:max-h-[95vh] overflow-y-auto shadow-2xl relative rounded-xl"
          layout
          style={{
            marginTop: "env(safe-area-inset-top)",
            marginBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {/* Close Button - Fixed position on mobile, absolute on desktop */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className=" absolute -top-2 right-2 z-50 bg-white/90 border backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all"
            style={{
              top: "max(0.5rem, env(safe-area-inset-top))",
            }}
          >
            <IoClose size={20} className="text-gray-600" />
          </motion.button>

          {fetchLoading ? (
            <div className="flex items-center justify-center h-screen sm:h-96">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full"
              />
            </div>
          ) : fetchError || !product ? (
            <div className="flex flex-col items-center justify-center h-screen sm:h-96 text-gray-500 p-8">
              <p className="text-center mb-4">
                Product not found or failed to load
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-primary text-white rounded-lg"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row min-h-screen sm:min-h-0">
              {/* Left — Image Gallery */}
              <div className="md:w-[45%] bg-gray-50 p-4 sm:p-6">
                <div className="relative aspect-square mb-3 sm:mt-0">
                  <Swiper
                    spaceBetween={10}
                    navigation={true}
                    pagination={{ clickable: true }}
                    thumbs={{ swiper: thumbsSwiper }}
                    modules={[Pagination, Navigation, Thumbs]}
                    onSlideChange={(swiper) => {
                      setActiveImageIndex(swiper.activeIndex);
                      setActiveImage(galleryImages[swiper.activeIndex]);
                    }}
                    initialSlide={activeImageIndex}
                    className="w-full h-full rounded-lg"
                  >
                    {galleryImages.map((img, idx) => (
                      <SwiperSlide key={idx}>
                        <div className="relative w-full h-full">
                          <Image
                            fill
                            src={img}
                            alt={`${product.product_name} - ${idx + 1}`}
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 45vw"
                            priority={idx === 0}
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {/* Discount Badge */}
                  {lineThoughPrice && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded"
                    >
                      {Math.round(
                        ((lineThoughPrice - productPrice) / lineThoughPrice) *
                          100,
                      )}
                      % OFF
                    </motion.span>
                  )}
                </div>

                {/* Thumbnails */}
                {galleryImages.length > 1 && (
                  <Swiper
                    onSwiper={setThumbsSwiper}
                    spaceBetween={8}
                    slidesPerView={4}
                    freeMode={true}
                    watchSlidesProgress={true}
                    modules={[Navigation, Thumbs]}
                    className="thumbnails-swiper"
                  >
                    {galleryImages.map((img, idx) => (
                      <SwiperSlide key={idx}>
                        <button
                          className={`relative w-full aspect-square rounded-md overflow-hidden border-2 transition-all ${
                            activeImageIndex === idx
                              ? "border-primary"
                              : "border-transparent hover:border-gray-300"
                          }`}
                        >
                          <Image
                            fill
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            className="object-cover"
                          />
                        </button>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </div>

              {/* Right — Details */}
              <div
                className="md:w-[55%] p-4 sm:p-6 overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 80px)" }}
              >
                <div className="space-y-4 pb-8 sm:pb-4">
                  {/* Brand/Title */}
                  <div className="mt-12 sm:mt-0">
                    {product.product_brand && (
                      <span className="text-xs text-gray-400 uppercase tracking-wider">
                        {product.product_brand}
                      </span>
                    )}
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mt-1 mr-0 md:mr-2 leading-tight">
                      {product.product_name}
                    </h2>
                  </div>

                  {/* Rating from product data */}
                  {(product?.avarage_review_ratting > 0 ||
                    product?.total_review_ratting > 0) && (
                    <div className="flex items-center gap-2">
                      <div className="flex text-sm">
                        {renderRatingStars(
                          product?.avarage_review_ratting || 0,
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        ({product.total_review_ratting || 0}{" "}
                        {product.total_review_ratting === 1
                          ? "review"
                          : "reviews"}
                        )
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-baseline gap-3">
                    <motion.span
                      key={productPrice}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-xl sm:text-2xl font-bold text-gray-900"
                    >
                      {currencySymbol}
                      {productPrice}
                    </motion.span>
                    {lineThoughPrice && (
                      <span className="text-sm sm:text-base line-through text-gray-400">
                        {currencySymbol}
                        {lineThoughPrice}
                      </span>
                    )}
                  </div>

                  {/* Short Description */}
                  {product.product_short_description && (
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed border-b border-gray-100 pb-3">
                      {product.product_short_description}
                    </p>
                  )}

                  {/* Variations */}
                  {product.is_variation &&
                    product.attributes_details?.map((attr, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <p className="text-xs sm:text-sm text-gray-700 mb-2 font-medium">
                          {attr.attribute_name}:
                          <span className="text-primary ml-1">
                            {selectedVariations[attr.attribute_name]
                              ?.attribute_value_name || "Select"}
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {attr.attribute_values?.map((val) => {
                            const isSelected =
                              selectedVariations[attr.attribute_name]
                                ?.attribute_value_name ===
                              val.attribute_value_name;
                            const isColor = isHexColor(
                              val.attribute_value_code,
                            );
                            return (
                              <motion.button
                                key={val._id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={() =>
                                  handleSelectVariation(
                                    val,
                                    attr.attribute_name,
                                  )
                                }
                                title={val.attribute_value_name}
                                className={`relative transition-all duration-200
                                ${
                                  isColor
                                    ? "w-7 h-7 sm:w-8 sm:h-8 rounded-full"
                                    : "px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md border"
                                }
                                ${
                                  isSelected
                                    ? isColor
                                      ? "ring-2 ring-primary ring-offset-2"
                                      : "border-primary bg-primary text-white"
                                    : isColor
                                      ? "hover:ring-2 hover:ring-gray-300 hover:ring-offset-2"
                                      : "border-gray-200 hover:border-primary text-gray-700 hover:text-primary"
                                }`}
                                style={{
                                  backgroundColor: isColor
                                    ? val.attribute_value_code
                                    : undefined,
                                }}
                              >
                                {!isColor && val.attribute_value_name}
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    ))}

                  {/* Quantity & Actions */}
                  {stock > 0 && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex gap-2 items-center mb-2">
                          <p className="text-xs sm:text-sm text-gray-700 font-medium">
                            Quantity:
                          </p>
                          {/* Share and More Options */}
                          <div className="flex items-center gap-3 w-full xs:w-auto justify-start xs:justify-end">
                            {/* Stock Status Badge */}
                            <div className="flex items-center gap-1.5">
                              {stock > 0 ? (
                                <>
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                  <span className="text-[10px] sm:text-xs text-gray-500">
                                    {stock} in stock
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                  <span className="text-[10px] sm:text-xs text-gray-500">
                                    Out of stock
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Share Button */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                if (navigator.share) {
                                  navigator.share({
                                    title: product.product_name,
                                    url:
                                      window.location.origin +
                                      `/products/${product.product_slug}`,
                                  });
                                } else {
                                  navigator.clipboard.writeText(
                                    window.location.origin +
                                      `/products/${product.product_slug}`,
                                  );
                                  toast.success("Link copied to clipboard!");
                                }
                              }}
                              className="text-gray-400 hover:text-primary transition-colors"
                              title="Share product"
                            >
                              <BsShare size={14} />
                            </motion.button>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={handleDecrement}
                            disabled={quantity <= 1}
                            className="px-3 sm:px-4 py-2 border border-gray-200 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg"
                          >
                            <HiMinus className="text-gray-600" size={14} />
                          </motion.button>
                          <input
                            type="number"
                            readOnly
                            value={quantity}
                            className="w-12 sm:w-16 text-center border-y border-gray-200 py-2 outline-none text-xs sm:text-sm font-medium"
                          />
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={handleIncrement}
                            disabled={quantity >= stock}
                            className="px-3 sm:px-4 py-2 border border-gray-200 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg"
                          >
                            <HiOutlinePlus
                              className="text-gray-600"
                              size={14}
                            />
                          </motion.button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Add to Cart */}
                        <motion.button
                          whileHover={
                            !isInCart && stock > 0 ? { scale: 1.02 } : {}
                          }
                          whileTap={
                            !isInCart && stock > 0 ? { scale: 0.98 } : {}
                          }
                          type="button"
                          onClick={handleAddToCart}
                          disabled={stock <= 0 || isInCart}
                          className={`
     flex-1   py-2 sm:py-3 flex items-center justify-center gap-2 
      transition text-xs sm:text-sm font-medium rounded-lg
      ${
        isInCart
          ? "bg-green-500 text-white cursor-not-allowed"
          : "bg-primary text-white hover:bg-primary/90"
      }
      disabled:opacity-50 disabled:cursor-not-allowed
    `}
                        >
                          {isInCart ? (
                            <>
                              <FiCheck size={16} />
                              In Cart
                            </>
                          ) : addedToCart ? (
                            <>
                              <FiCheck size={16} />
                              Added
                            </>
                          ) : (
                            <>
                              <BsCart size={16} />
                              Add to Cart
                            </>
                          )}
                        </motion.button>

                        {/* View Details (same width as Add to Cart) */}
                        <Link
                          href={`/products/${product.product_slug}`}
                          onClick={onClose}
                          className="flex-1 "
                        >
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            className="w-full py-2 sm:py-3 flex items-center justify-center gap-2
                 text-xs sm:text-sm font-medium rounded-lg
                 border border-primary text-primary hover:bg-primary/5 transition"
                          >
                            View Details
                            <FiArrowUpRight size={14} />
                          </motion.button>
                        </Link>

                        {/* Wishlist */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={handleWishlist}
                          className="p-2 sm:p-3 border border-gray-200 hover:border-primary 
               rounded-lg transition-all shrink-0"
                        >
                          {isWishlisted ? (
                            <BsHeartFill size={16} className="text-primary" />
                          ) : (
                            <BsHeart size={16} className="text-gray-600" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  )}

                  {/* Features - Alternative Grid Layout */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <MdOutlineLocalShipping
                        className="mx-auto text-primary mb-1"
                        size={20}
                      />
                      <p className="text-xs font-medium text-gray-800">
                        Free Delivery
                      </p>
                      <p className="text-[9px] text-gray-500">
                        On orders above ৳999
                      </p>
                    </div>

                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <svg
                        className="w-5 h-5 mx-auto text-primary mb-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                      <p className="text-xs font-medium text-gray-800">
                        Genuine Leather
                      </p>
                      <p className="text-[9px] text-gray-500">100% authentic</p>
                    </div>

                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <TbTruckReturn
                        className="mx-auto text-primary mb-1"
                        size={20}
                      />
                      <p className="text-xs font-medium text-gray-800">
                        Easy Return
                      </p>
                      <p className="text-[9px] text-gray-500">
                        Instant if you don't like
                      </p>
                    </div>

                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <RiSecurePaymentLine
                        className="mx-auto text-primary mb-1"
                        size={20}
                      />
                      <p className="text-xs font-medium text-gray-800">
                        Cash on Delivery
                      </p>
                      <p className="text-[9px] text-gray-500">
                        Pay when you receive
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickViewModal;
