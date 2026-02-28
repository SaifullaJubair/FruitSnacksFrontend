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
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  // Gallery images
  const [galleryImages, setGalleryImages] = useState([]);

  // Full product fetch
  useEffect(() => {
    if (!listProduct?.product_slug) return;
    setFetchLoading(true);
    fetch(`${BASE_URL}/product/${listProduct.product_slug}`)
      .then((r) => r.json())
      .then((data) => {
        const p = data?.data;
        setProduct(p);

        // Setup gallery images with all available images
        const images = [p?.main_image];

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

        // Check wishlist status
        try {
          const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
          const isInWishlist = wishlist.some(
            (item) => item.productId === p?._id && !item.variation_product_id,
          );
          setIsWishlisted(isInWishlist);
        } catch (error) {
          console.error("Error reading wishlist:", error);
        }

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

          // Check wishlist for variation
          const variationInWishlist = wishlist.some(
            (item) =>
              item.productId === p?._id &&
              item.variation_product_id === firstVariation._id,
          );
          setIsWishlisted(variationInWishlist);

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
    cartProducts,
    quantity,
    dispatch,
    trackAddToCart,
    userInfo,
    productPrice,
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
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
        style={{ overscrollBehavior: "contain" }}
      >
        <motion.div
          ref={modalRef}
          className="bg-white w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl relative rounded-xl"
          layout
        >
          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="sticky top-4 z-50 float-right mr-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all"
          >
            <IoClose size={20} className="text-gray-600" />
          </motion.button>

          {fetchLoading ? (
            <div className="flex items-center justify-center h-96">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full"
              />
            </div>
          ) : !product ? (
            <div className="flex items-center justify-center h-96 text-gray-500">
              Product not found
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row">
              {/* Left — Image Gallery */}
              <div className="lg:w-[45%] bg-gray-50 p-4 sm:p-6">
                <div className="relative aspect-square mb-3">
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
              <div className="lg:w-[55%] p-4 sm:p-6 overflow-y-auto max-h-[50vh] lg:max-h-[85vh]">
                <div className="space-y-4">
                  {/* Brand/Title */}
                  <div>
                    {product.product_brand && (
                      <span className="text-xs text-gray-400 uppercase tracking-wider">
                        {product.product_brand}
                      </span>
                    )}
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mt-1 leading-tight">
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

                  {/* Stock Status */}
                  <div className="flex items-center gap-2">
                    {stock > 0 ? (
                      <>
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <p className="text-xs sm:text-sm text-green-600 font-medium">
                          In Stock ({stock} available)
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 bg-red-500 rounded-full" />
                        <p className="text-xs sm:text-sm text-red-500 font-medium">
                          Out of Stock
                        </p>
                      </>
                    )}
                  </div>

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
                        <p className="text-xs sm:text-sm text-gray-700 mb-2 font-medium">
                          Quantity:
                        </p>
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

                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={handleAddToCart}
                          disabled={stock <= 0}
                          className="flex-1 py-2 sm:py-3 flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 transition text-xs sm:text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {addedToCart ? (
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

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={handleWishlist}
                          className="p-2 sm:p-3 border border-gray-200 hover:border-primary rounded-lg transition-all"
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

                  {/* View Full Details Link */}
                  <Link
                    href={`/products/${product.product_slug}`}
                    onClick={onClose}
                  >
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="inline-flex items-center gap-1 text-xs sm:text-sm text-primary font-medium hover:underline"
                    >
                      View Full Details
                      <FiArrowUpRight size={14} />
                    </motion.div>
                  </Link>

                  {/* Features */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                    <div className="text-center">
                      <MdOutlineLocalShipping
                        className="mx-auto text-gray-400 mb-1"
                        size={16}
                      />
                      <span className="text-[10px] sm:text-xs text-gray-500">
                        Free Shipping
                      </span>
                    </div>
                    <div className="text-center">
                      <TbTruckReturn
                        className="mx-auto text-gray-400 mb-1"
                        size={16}
                      />
                      <span className="text-[10px] sm:text-xs text-gray-500">
                        7 Days Return
                      </span>
                    </div>
                    <div className="text-center">
                      <RiSecurePaymentLine
                        className="mx-auto text-gray-400 mb-1"
                        size={16}
                      />
                      <span className="text-[10px] sm:text-xs text-gray-500">
                        Secure
                      </span>
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
