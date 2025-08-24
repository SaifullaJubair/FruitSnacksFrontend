"use client";

import Contain from "@/components/common/Contain";
import ProductPhotoSelect from "./productDetails/ProductPhotoSelect";
import ProductHighlightSection from "./productHighLightSection/ProductHighlightSection";
import ProductReviewAccordion from "./productReviewAccordion/ProductReviewAccordion";
import ProductDescription from "./productDescription/ProductDescription";
import RightSideShoppingSection from "./rightSideShoppingSection/RightSideShoppingSection";
import RecentProducts from "./sellerProduct/RecentProducts";
import RelatedProducts from "./relatedProducts/RelatedProducts";
import QnAAccordion from "./qnaAccordion/QnAAccordion";
import { useEffect, useState } from "react";
import { updateRecentProducts } from "@/utils/helper";
import { toast } from "react-toastify";
import { addToCart } from "@/redux/feature/cart/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { calculatePrice, singleProductPrice } from "@/utils/helper";
import DeliveryInformation from "../checkout/DeliveryInformation";
import { useForm } from "react-hook-form";
import useGetSettingData from "@/components/lib/getSettingData";
import { useUserInfoQuery } from "@/redux/feature/auth/authApi";
import { districts } from "@/data/districts";
import RightSideProductSummary from "./rightSideShoppingSection/RightSideProductSummary";
import { BASE_URL } from "@/components/utils/baseURL";
import RightSideDeliveryInfo from "./rightSideShoppingSection/RightSideDeliveryInfo";
import { useRouter } from "next/navigation";
import "react-phone-number-input/style.css";
import PhoneInput, {
  formatPhoneNumber,
  isPossiblePhoneNumber,
  isValidPhoneNumber,
} from "react-phone-number-input";
import MobileDeliveryInfoAccordion from "./rightSideShoppingSection/MobileDeliveryInfoAccordion";
import ReturnPolicyAccordion from "./returnPolicyAccordion/ReturnPolicyAccordion";
import useGetZoneData from "@/components/lib/getZoneData";
const SingleProduct = ({ product }) => {
  useEffect(() => {
    if (product) {
      updateRecentProducts(product);
    }
  }, [product]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const { data: settingData, isLoading: settingLoading } = useGetSettingData();
  const { data: userInfo, isLoading: userGetLoading } = useUserInfoQuery();
  const [districtsData, setDistrictsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const navigate = useRouter();
  const [customer_phone, setUserPhone] = useState(
    userInfo?.data?.user_phone?.slice(3, 14)
  );
  const [userPhoneLogin, setUserPhoneLogin] = useState(false);
  useEffect(() => {
    if (userInfo?.data?.user_phone) {
      setUserPhone(userInfo?.data?.user_phone?.slice(3, 14));
    }
  }, [userInfo?.data?.user_phone]);

  const [divisionID, setDivisionID] = useState();
  const [division, setDivision] = useState();
  const [districtId, setDistrictId] = useState("");
  const [district, setDistrict] = useState();
  const [isOpenDistrict, setIsOpenDistrict] = useState(true);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [shopSubtotals, setShopSubtotals] = useState(0);
  const [shopTotal, setShopTotal] = useState(0);
  const [shopGrandTotals, setShopGrandTotals] = useState(0);
  const [selectedVariations, setSelectedVariations] = useState({});

  const [slug, setSlug] = useState("");
  const [variationProduct, setVariationProduct] = useState(null);
  const [stock, setStock] = useState(
    product?.is_variation === true
      ? product?.variations?.[0]?.variation_quantity
      : product?.product_quantity
  );
  const [productPrice, setProductPrice] = useState(null);
  const [lineThoughPrice, setLineThoughPrice] = useState(null);
  const cartProducts = useSelector((state) => state.cart.products);
  const dispatch = useDispatch();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCompare, setIsCompare] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const shippingCharge =
    division === "Dhaka"
      ? settingData?.data?.[0]?.inside_dhaka_shipping_charge || 0
      : settingData?.data?.[0]?.outside_dhaka_shipping_charge || 0;

  const {
    data: zoneData,
    isLoading: zoneLoading,
    refetch: refetchZone,
  } = useGetZoneData(divisionID);

  useEffect(() => {
    setProductPrice(singleProductPrice(product));
    if (
      product?.variations?.[0]?.variation_discount_price ||
      product?.product_discount_price
    ) {
      setLineThoughPrice(
        product?.variations?.[0]?.variation_price || product?.product_price
      );
    }
    if (product?.is_variation === true) {
      setSlug(product?.variations?.[0]?.variation_name);
      setVariationProduct(product?.variations?.[0]);
      setStock(product?.variations?.[0]?.variation_quantity);
    } else {
      setStock(product?.product_quantity);
    }

    if (product?.is_variation && product?.attributes_details) {
      const initialVariations = {};
      product?.attributes_details?.forEach((item) => {
        if (item?.attribute_values?.length > 0) {
          initialVariations[item?.attribute_name] = item?.attribute_values?.[0];
        }
      });
      setSelectedVariations(initialVariations);
      const initialSlug = generateSlug(initialVariations);
      const initialVariationProduct = findVariationDetails(initialSlug);
      setSlug(initialSlug);
      setVariationProduct(initialVariationProduct);
    }
  }, [product]);

  const handleSelectVariation = (value, attributeName) => {
    const newVariations = { ...selectedVariations, [attributeName]: value };
    setSelectedVariations(newVariations);
    const newSlug = generateSlug(newVariations);
    const newVariationProduct = findVariationDetails(newSlug);
    setSlug(newSlug);
    setVariationProduct(newVariationProduct);

    if (newVariationProduct) {
      setStock(newVariationProduct?.variation_quantity);

      let price = newVariationProduct?.variation_discount_price
        ? newVariationProduct?.variation_discount_price
        : newVariationProduct?.variation_price;

      if (product?.flash_sale_details) {
        const flashProduct = product.flash_sale_details.flash_sale_product;
        const priceType = flashProduct?.flash_price_type;
        const discountPrice = flashProduct?.flash_sale_product_price;
        const originalPrice = price;

        if (priceType) {
          price = calculatePrice(originalPrice, discountPrice, priceType);
        }
        setLineThoughPrice(newVariationProduct?.variation_price);
      } else if (product?.campaign_details?.campaign_product) {
        const campaignProduct = product.campaign_details.campaign_product;
        const priceType = campaignProduct?.campaign_price_type;
        const discountPrice = campaignProduct?.campaign_product_price;
        const originalPrice = price;

        if (priceType) {
          price = calculatePrice(originalPrice, discountPrice, priceType);
        }
        setLineThoughPrice(newVariationProduct?.variation_price);
      } else {
        if (newVariationProduct?.variation_discount_price === 0) {
          setLineThoughPrice(null);
        } else {
          setLineThoughPrice(newVariationProduct?.variation_price);
        }
      }

      setProductPrice(price);
    }
  };

  const generateSlug = (variations) => {
    return Object.values(variations)
      .map((value) => value.attribute_value_name)
      .join("-");
  };

  const findVariationDetails = (slug) => {
    return product?.variations?.find((v) => v.variation_name === slug);
  };

  const handleIncrement = () => {
    // setQuantity(quantity + 1);

    if (quantity < stock) {
      setQuantity(quantity + 1);
    } else {
      toast.error("Stock not available");
      return;
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  const maxQuantity = stock || product?.product_quantity || 1;

  const handleAddToCart = () => {
    const cartItem = {
      productId: product?._id,
      quantity: quantity,
      variation_product_id: variationProduct ? variationProduct?._id : null,
    };
    const productID = cartProducts.find(
      (cartItem) => cartItem?.productId === product?._id
    );
    if (variationProduct) {
      const variationID = cartProducts.find(
        (cartItem) => cartItem?.variation_product_id === variationProduct?._id
      );

      if (productID && variationID) {
        toast.error("Already is added cart", {
          autoClose: 1500,
        });
      } else {
        dispatch(addToCart(cartItem));
        toast.success("Successfully added to cart", {
          autoClose: 1500,
        });
      }
    } else if (productID) {
      toast.error("Already is added cart", {
        autoClose: 1500,
      });
    } else {
      dispatch(addToCart(cartItem));
      toast.success("Successfully added to cart", {
        autoClose: 1500,
      });
    }
    // dispatch(addToCart(cartItem));
    // toast.success("Successfully added to cart", {
    //   autoClose: 1500,
    // });
  };

  useEffect(() => {
    // Check if product is in the wishlist when the component mounts
    try {
      const existingWishlist =
        JSON.parse(localStorage.getItem("wishlist")) || [];
      const existingCompare = JSON.parse(localStorage.getItem("compare")) || [];
      const productExists = existingWishlist.some(
        (item) =>
          item.productId === product?._id &&
          item.variation_product_id ===
            (variationProduct ? variationProduct?._id : null)
      );
      const productExistsCompare = existingCompare.some(
        (item) =>
          item.productId === product?._id &&
          item.variation_product_id ===
            (variationProduct ? variationProduct?._id : null)
      );
      setIsWishlisted(productExists);
      setIsCompare(productExistsCompare);
    } catch (error) {
      console.error("Error parsing wishlist from localStorage", error);
    }
  }, [product?._id, variationProduct?._id]);
  const handleWishlist = () => {
    const wishListItem = {
      productId: product?._id,
      variation_product_id: variationProduct ? variationProduct?._id : null,
    };

    let existingWishlist = [];
    try {
      existingWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    } catch (error) {
      console.error("Error parsing wishlist from localStorage", error);
    }

    const productIndex = existingWishlist.findIndex(
      (item) =>
        item.productId === product?._id &&
        item.variation_product_id ===
          (variationProduct ? variationProduct?._id : null)
    );

    if (productIndex !== -1) {
      // If the product is in the wishlist, remove it
      existingWishlist.splice(productIndex, 1);
      setIsWishlisted(false);
      toast.error("Product removed from your wishlist", { autoClose: 1500 });
    } else {
      // If the product is not in the wishlist, add it
      existingWishlist.push(wishListItem);
      setIsWishlisted(true);
      toast.success("Product added to your wishlist", { autoClose: 1500 });
    }

    // Update the wishlist in localStorage
    localStorage.setItem("wishlist", JSON.stringify(existingWishlist));
    window.dispatchEvent(new Event("localStorageUpdated"));
  };
  const handleAddToCompare = () => {
    const compareItem = {
      productId: product?._id,
      variation_product_id: variationProduct ? variationProduct?._id : null,
    };

    let existingCompare = [];
    try {
      existingCompare = JSON.parse(localStorage.getItem("compare")) || [];
    } catch (error) {
      console.error("Error parsing compare from localStorage", error);
    }

    const productIndex = existingCompare.findIndex(
      (item) =>
        item.productId === product?._id &&
        item.variation_product_id ===
          (variationProduct ? variationProduct?._id : null)
    );

    if (productIndex !== -1) {
      // If the product is in the wishlist, remove it
      existingCompare.splice(productIndex, 1);
      setIsCompare(false);
      toast.error("Product removed from your compare", { autoClose: 1500 });
    } else {
      // If the product is not in the wishlist, add it
      existingCompare.push(compareItem);
      setIsCompare(true);
      toast.success("Product added to your compare", { autoClose: 1500 });
    }

    // Update the wishlist in localStorage
    localStorage.setItem("compare", JSON.stringify(existingCompare));
    window.dispatchEvent(new Event("localStorageUpdated"));
  };

  useEffect(() => {
    const subtotal =
      (lineThoughPrice === null ? productPrice : lineThoughPrice) * quantity;
    setShopSubtotals(subtotal);
    const total = productPrice * quantity;
    setShopTotal(total);
    const discount = subtotal - total;
    setTotalDiscount(discount);
    const grandTotal = total + shippingCharge;
    setShopGrandTotals(grandTotal);
  }, [productPrice, quantity, lineThoughPrice, shippingCharge]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setIsAccordionOpen(true);
    }
  }, [errors]);
  const handleOrderProduct = async (data) => {
    if (userPhoneLogin == false) {
      if (customer_phone) {
        const formatPhoneNumberValueCheck = formatPhoneNumber(customer_phone);
        const isPossiblePhoneNumberValueCheck =
          isPossiblePhoneNumber(customer_phone);
        const isValidPhoneNumberValueCheck = isValidPhoneNumber(customer_phone);
        if (formatPhoneNumberValueCheck == false) {
          toast.error("Mobile number not valid !", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          return;
        }
        if (isPossiblePhoneNumberValueCheck == false) {
          toast.error("Mobile number not valid !", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          return;
        }
        if (isValidPhoneNumberValueCheck == false) {
          toast.error("Mobile number not valid !", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          return;
        }
      }
    }

    if (!customer_phone) {
      toast.error("Phone is required !", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }

    const today =
      new Date().toISOString().split("T")[0] +
      " " +
      new Date().toLocaleTimeString();
    if (!district || !division || !divisionID || !districtId)
      return toast.error("Please select a City and Zone.");

    const sendData = {
      order_status: "pending",
      pending_time: today,
      customer_id: userInfo?.data?._id || null,
      customer_phone: customer_phone ? customer_phone : data?.customer_phone,
      billing_country: "Bangladesh",
      billing_city: district || userInfo?.data?.user_district,
      billing_state: division || userInfo?.data?.user_division,
      billing_address: data?.address,
      user_name: data?.customer_name,
      // user_password: data?.user_password || null,
      need_user_create: userInfo?.data?.user_phone ? false : true,
      shipping_location:
        division === "Dhaka"
          ? ` Inside Dhaka, ${settingData?.data[0]?.inside_dhaka_shipping_days} Days`
          : `Outside Dhaka, ${settingData?.data[0]?.outside_dhaka_shipping_days} Days`,
      sub_total_amount: shopTotal ? shopTotal : 0,
      discount_amount: totalDiscount || 0,
      shipping_cost: shippingCharge || 0,
      grand_total_amount: shopGrandTotals ? shopGrandTotals : 0,
      coupon_id: null,
      pathao_city_id: parseInt(divisionID),
      pathao_city_name: division,
      pathao_zone_id: parseInt(districtId),
      pathao_zone_name: district,

      order_products: [product]?.map((item) => {
        return {
          product_id: item._id,
          variation_id: variationProduct?._id || null,
          product_main_price: lineThoughPrice ? lineThoughPrice : productPrice,
          product_main_discount_price:
            variationProduct?.variation_discount_price
              ? variationProduct?.variation_discount_price
              : product?.product_discount_price
              ? product?.product_discount_price
              : 0,
          product_unit_price: productPrice,
          product_unit_final_price: productPrice,
          product_quantity: quantity,
          product_grand_total_price: productPrice * quantity || 0,
          campaign_id: item?.campaign_details?._id || null,
        };
      }),
    };

    // console.log("sendData:", sendData);
    // return
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/order/single_order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sendData),
      });
      const result = await response.json();
      // if (response.success) {
      //   sessionStorage.removeItem("order_info");
      // }
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success(
          result?.message ? result?.message : "Order created successfully",
          {
            autoClose: 1000,
          }
        );
        navigate.push("/orders/order-success");
        setLoading(false);
      } else {
        toast.error(result?.message || "Something went wrong", {
          autoClose: 1000,
        });
        setLoading(false);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error posting data:", error);
      setLoading(false);
    }
  };

  return (
    <Contain>
      <div className="bg-white p-2 sm:p-5  ">
        <form onSubmit={handleSubmit(handleOrderProduct)}>
          <div className="grid  grid-cols-1 sm:grid-cols-3 md:grid-cols-7 lg:grid-cols-7  xl:grid-cols-8 xl:gap-4">
            <div className="xl:col-span-2 lg:col-span-2 md:col-span-2 sm:col-span-1  col-span-1 ">
              <ProductPhotoSelect
                product={product}
                variationProduct={variationProduct}
              />
            </div>

            {/* Name price and buy add to cart section  */}
            <div className="lg:col-span-3 md:col-span-3 sm:col-span-2 col-span-1 px-4 xl:col-span-4 ">
              <ProductHighlightSection
                product={product}
                productPrice={productPrice}
                lineThoughPrice={lineThoughPrice}
                stock={stock}
                quantity={quantity}
                setQuantity={setQuantity}
                handleIncrement={handleIncrement}
                handleDecrement={handleDecrement}
                isWishlisted={isWishlisted}
                isCompare={isCompare}
                handleAddToCompare={handleAddToCompare}
                handleWishlist={handleWishlist}
                handleSelectVariation={handleSelectVariation}
                selectedVariations={selectedVariations}
                maxQuantity={maxQuantity}
                handleAddToCart={handleAddToCart}
              />
            </div>

            {/*--------- right sidebar -------- */}
            <div className="lg:col-span-2 md:col-span-2 sm:col-span-3  col-span-1 ">
              <RightSideDeliveryInfo
                register={register}
                userInfo={userInfo}
                errors={errors}
                setDivision={setDivision}
                setDistrictId={setDistrictId}
                setDivisionID={setDivisionID}
                division={division}
                district={district}
                setDistrict={setDistrict}
                setIsOpenDistrict={setIsOpenDistrict}
                isOpenDistrict={isOpenDistrict}
                districtsData={districtsData}
                watch={watch}
                loading={userGetLoading}
                isAccordionOpen={isAccordionOpen}
                setIsAccordionOpen={setIsAccordionOpen}
                customer_phone={customer_phone}
                setUserPhone={setUserPhone}
                setUserPhoneLogin={setUserPhoneLogin}
                refetchZone={refetchZone}
                zoneLoading={zoneLoading}
                zoneData={zoneData}
              />
              <RightSideProductSummary
                totalDiscount={totalDiscount}
                shippingCharge={shippingCharge}
                shopSubtotals={shopSubtotals}
                shopGrandTotals={shopGrandTotals}
                division={division}
                loading={loading}
                shopTotal={shopTotal}
                stock={stock}
              />
              {/* <RightSideShoppingSection
                product={product}
                settingData={settingData}
              /> */}
            </div>
          </div>
        </form>

        <div className="grid lg:grid-cols-7 md:grid-5 grid-cols-1 gap-2 my-10">
          <div className="lg:col-span-5 md:col-span-3 col-span-1">
            <ProductDescription product={product} />
            <ProductReviewAccordion product={product} />
            <MobileDeliveryInfoAccordion
              product={product}
              settingData={settingData}
            />
            <ReturnPolicyAccordion />
            {/* <QnAAccordion product={product} /> */}
          </div>

          <div className="lg:col-span-2 md:col-span-2 col-span-1">
            <RecentProducts
              productId={product?._id}
              product_slug={product?.product_slug}
            />
          </div>
        </div>
      </div>

      {/* Related Product */}

      <div className=" mt-16 mb-4  bg-white p-4">
        <p className="text-primary text-lg font-bold mb-4">RELATED PRODUCT</p>

        <RelatedProducts product_slug={product?.product_slug} />
      </div>
    </Contain>
  );
};

export default SingleProduct;
