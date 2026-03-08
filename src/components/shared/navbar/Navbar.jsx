"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useUserInfoQuery } from "@/redux/feature/auth/authApi";
import useGetSettingData from "@/components/lib/getSettingData";
import { BASE_URL } from "@/components/utils/baseURL";
import { toast } from "react-toastify";
import Marquee from "react-fast-marquee";
import { useGetAllProductAndSearchProduct } from "@/components/lib/getAllProductandSearchProduct";
import useDebounced from "@/hook/useDebounced";
import { lineThroughPrice, productPrice } from "@/utils/helper";
import useAnalytics from "@/components/analyticsScripts/utils/useAnalytics";

import {
  FiMenu,
  FiX,
  FiSearch,
  FiHeart,
  FiShoppingCart,
  FiUser,
  FiChevronRight,
  FiChevronDown,
  FiHome,
  FiGrid,
  FiPackage,
  FiTruck,
  FiLogOut,
} from "react-icons/fi";
import { BiPurchaseTag } from "react-icons/bi";
import { MdOutlineHome } from "react-icons/md";
import { TbJewishStar, TbLogout2 } from "react-icons/tb";
import { SlUserFollowing } from "react-icons/sl";
import { IoSettingsOutline } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { AiOutlineProduct } from "react-icons/ai";
import { IoMdFlame } from "react-icons/io";
import { FaFire } from "react-icons/fa";
import Contain from "@/components/common/Contain";

// ─── Search Overlay ────────────────────────────────────────────────────────────
const SearchOverlay = ({ isOpen, onClose }) => {
  const [searchValue, setSearchValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { data: settingsData } = useGetSettingData();
  const { trackSearch } = useAnalytics();
  const inputRef = useRef(null);
  const router = useRouter();

  const { data: searchData } = useGetAllProductAndSearchProduct({
    page: 1,
    limit: 12,
    searchTerm,
  });

  const searchText = useDebounced({ searchQuery: searchValue, delay: 400 });

  useEffect(() => {
    setSearchTerm(searchText);
    if (searchText) trackSearch(searchText);
  }, [searchText]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setSearchValue("");
      setSearchTerm("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const currencySymbol = settingsData?.data?.[0]?.currency_symbol;

  const handleSubmit = (e) => {
    e.preventDefault();
    onClose();
    if (searchValue.trim()) router.push(`/all-products?search=${searchValue}`);
    else router.push("/all-products");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white w-full shadow-2xl z-10 max-h-[85vh] flex flex-col">
        {/* Search input row */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 px-4 md:px-8 py-4 border-b border-gray-100"
        >
          <FiSearch size={20} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search for wallets, bags, belts..."
            className="flex-1 text-base md:text-lg text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            autoComplete="off"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => setSearchValue("")}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium hidden md:block"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ml-1 md:hidden text-gray-500 hover:text-gray-800"
          >
            <FiX size={20} />
          </button>
        </form>

        {/* Results */}
        {searchValue && (
          <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-200">
            {searchData?.data?.length > 0 ? (
              <>
                <p className="px-4 md:px-8 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                  {searchData.data.length} results for "{searchValue}"
                </p>
                <div className="divide-y divide-gray-50">
                  {searchData.data.map((product) => (
                    <Link
                      key={product._id}
                      href={`/products/${product.product_slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 px-4 md:px-8 py-3 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                        <img
                          src={product.main_image}
                          alt={product.product_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate group-hover:text-primary transition-colors">
                          {product.product_name}
                        </p>
                        {product.product_category?.category_name && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {product.product_category.category_name}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-primary">
                          {currencySymbol}
                          {productPrice(product)}
                        </p>
                        {lineThroughPrice(product) && (
                          <p className="text-xs text-gray-400 line-through">
                            {currencySymbol}
                            {lineThroughPrice(product)}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="px-4 md:px-8 py-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      router.push(`/all-products?search=${searchValue}`);
                      onClose();
                    }}
                    className="w-full text-center text-sm text-primary font-medium hover:underline py-1"
                  >
                    View all results for "{searchValue}" →
                  </button>
                </div>
              </>
            ) : searchTerm ? (
              <div className="px-4 md:px-8 py-10 text-center text-gray-400">
                <FiSearch size={32} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No results for "{searchValue}"</p>
                <p className="text-sm mt-1">Try a different keyword</p>
              </div>
            ) : null}
          </div>
        )}

        {/* Empty state hint */}
        {!searchValue && (
          <div className="px-4 md:px-8 py-6 text-sm text-gray-400">
            <p className="font-medium text-gray-500 mb-2">Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {["Wallet", "Bag", "Belt", "Card Holder", "Leather"].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchValue(tag)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-primary hover:text-white text-gray-600 rounded-full text-xs font-medium transition-colors"
                  >
                    {tag}
                  </button>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Announcement Marquee ──────────────────────────────────────────────────────
const AnnouncementBar = ({ message }) => {
  if (!message) return null;
  return (
    <div className="bg-primary text-white text-xs py-1.5 overflow-hidden">
      <Marquee speed={60} gradient={false} pauseOnHover autoPlay>
        <span className="mx-16 tracking-wide font-medium opacity-90">
          {message}
        </span>
        <span className="mx-16 tracking-wide font-medium opacity-70">
          🎁 Free delivery on orders above ৳999
        </span>
        <span className="mx-16 tracking-wide font-medium opacity-90">
          {message}
        </span>
        <span className="mx-16 tracking-wide font-medium opacity-70">
          ✅ 100% Genuine Leather Products
        </span>
      </Marquee>
    </div>
  );
};

// ─── Category Mega Dropdown ────────────────────────────────────────────────────
const CategoriesMegaMenu = ({ menuData, onClose }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeSub, setActiveSub] = useState(null);
  const activeCategory = menuData?.[activeIdx];

  return (
    <div
      className="absolute top-full left-0 mt-0 bg-white shadow-2xl border-t-2 border-primary z-50 flex"
      style={{ width: 720 }}
    >
      {/* Col 1 — Category list */}
      <div className="w-[200px] bg-gray-50 py-2 border-r border-gray-100 shrink-0">
        {menuData?.map((item, idx) => (
          <button
            key={item?.category?._id}
            onMouseEnter={() => {
              setActiveIdx(idx);
              setActiveSub(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
              activeIdx === idx
                ? "bg-primary text-white font-semibold"
                : "text-gray-700 hover:bg-gray-100 font-medium"
            }`}
          >
            {item?.category?.category_logo ? (
              <img
                src={item.category.category_logo}
                alt=""
                className={`w-6 h-6 object-contain rounded shrink-0 ${activeIdx === idx ? "brightness-0 invert" : ""}`}
              />
            ) : (
              <FiGrid size={15} className="shrink-0 opacity-60" />
            )}
            <span className="truncate">{item?.category?.category_name}</span>
            {item?.sub_categories?.length > 0 && (
              <FiChevronRight
                size={12}
                className="ml-auto shrink-0 opacity-60"
              />
            )}
          </button>
        ))}
      </div>

      {/* Col 2 — Sub categories */}
      <div className="flex-1 py-4 px-5">
        {activeCategory && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800">
                {activeCategory?.category?.category_name}
              </h3>
              <Link
                href={`/category/${activeCategory?.category?.category_slug}`}
                onClick={onClose}
                className="text-xs text-primary font-semibold hover:underline"
              >
                View All →
              </Link>
            </div>

            {activeCategory?.sub_categories?.length > 0 ? (
              <div className="grid grid-cols-2 gap-1">
                {activeCategory.sub_categories.map((sub) => (
                  <div key={sub._id}>
                    <button
                      onMouseEnter={() =>
                        setActiveSub(activeSub?._id === sub._id ? null : sub)
                      }
                      onClick={() => onClose()}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                        activeSub?._id === sub._id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                      }`}
                    >
                      <Link
                        href={`/category/${activeCategory.category.category_slug}/${sub.sub_category_slug}`}
                        className="flex-1"
                        onClick={onClose}
                      >
                        {sub.sub_category_name}
                      </Link>
                      {sub?.child_categories?.length > 0 && (
                        <FiChevronRight
                          size={11}
                          className="shrink-0 opacity-50"
                        />
                      )}
                    </button>

                    {/* Child categories inline */}
                    {activeSub?._id === sub._id &&
                      sub?.child_categories?.length > 0 && (
                        <div className="ml-3 mt-0.5 space-y-0.5">
                          {sub.child_categories.map((child) => (
                            <Link
                              key={child._id}
                              href={`/category/${activeCategory.category.category_slug}/${sub.sub_category_slug}/${child.child_category_slug}`}
                              onClick={onClose}
                              className="block px-3 py-1.5 text-xs text-gray-500 hover:text-primary hover:bg-gray-50 rounded-md"
                            >
                              › {child.child_category_name}
                            </Link>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-300">
                <FiPackage size={28} className="mb-2" />
                <p className="text-xs">No subcategories</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─── Account Dropdown ──────────────────────────────────────────────────────────
const AccountDropdown = ({ userInfo, onLogout, onClose }) => {
  const menuItems = [
    {
      href: "/user-profile?tab=dashboard",
      icon: MdOutlineHome,
      label: "Dashboard",
    },
    {
      href: "/user-profile?tab=wishlist",
      icon: TbJewishStar,
      label: "Wishlist",
    },
    {
      href: "/user-profile?tab=purchase-history",
      icon: BiPurchaseTag,
      label: "Purchase History",
    },
    {
      href: "/user-profile?tab=review",
      icon: SlUserFollowing,
      label: "Reviews",
    },
    {
      href: "/user-profile?tab=profile-setting",
      icon: IoSettingsOutline,
      label: "Settings",
    },
  ];

  return (
    <div className="absolute right-0 top-full mt-2 w-60 bg-white shadow-2xl border border-gray-100 rounded-xl overflow-hidden z-50">
      {userInfo?.data ? (
        <>
          <div className="px-4 py-3.5 bg-gradient-to-r from-primary to-primary-600 text-white">
            <div className="flex items-center gap-3">
              {userInfo.data.user_image ? (
                <img
                  src={userInfo.data.user_image}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover border-2 border-white/30"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <FaUserCircle size={22} className="text-white/80" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">
                  {userInfo.data.user_name}
                </p>
                <p className="text-xs text-white/70 truncate">
                  {userInfo.data.user_phone}
                </p>
              </div>
            </div>
          </div>
          <div className="py-1">
            {menuItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-primary hover:text-white transition-colors"
              >
                <Icon size={15} className="shrink-0" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-100 px-3 py-2.5">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              <TbLogout2 size={16} />
              Sign Out
            </button>
          </div>
        </>
      ) : (
        <div className="p-4 space-y-2.5">
          <p className="text-sm font-semibold text-gray-700 text-center">
            Welcome back!
          </p>
          <Link
            href="/sign-in"
            onClick={onClose}
            className="block w-full text-center py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            onClick={onClose}
            className="block w-full text-center py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Create Account
          </Link>
        </div>
      )}
    </div>
  );
};

// ─── Mobile Drawer ─────────────────────────────────────────────────────────────
const MobileDrawer = ({
  isOpen,
  onClose,
  menuData,
  userInfo,
  onLogout,
  siteData,
}) => {
  const [expandedCat, setExpandedCat] = useState(null);
  const [expandedSub, setExpandedSub] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isActive = (r) => pathname === r;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      <div
        className={`fixed left-0 top-0 h-full w-[290px] bg-white z-50 md:hidden transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-gray-50">
          {siteData?.logo && (
            <Link href="/" onClick={onClose}>
              <img
                src={siteData.logo}
                alt=""
                className="h-9 w-auto object-contain"
              />
            </Link>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors ml-auto"
          >
            <FiX size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
          {/* Quick links */}
          <div className="py-3 px-3 border-b border-gray-100">
            {[
              { href: "/", label: "Home", icon: FiHome },
              {
                href: "/all-products",
                label: "All Products",
                icon: AiOutlineProduct,
              },
              { href: "/new-arrival", label: "New Arrival", icon: FiPackage },
              // { href: "/offer", label: "Offers", icon: IoMdFlame },
              // { href: "/campaign", label: "Campaign", icon: FaFire },
              {
                href: "/orders/order-tracking",
                label: "Track Order",
                icon: FiTruck,
              },
              { href: "/wishlist", label: "Wishlist", icon: FiHeart },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(href)
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon size={17} className="shrink-0" />
                {label}
              </Link>
            ))}
          </div>

          {/* Categories */}
          <div className="py-3 px-3">
            <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Categories
            </p>
            {menuData?.map((item) => (
              <div key={item?.category?._id}>
                <button
                  onClick={() =>
                    setExpandedCat(
                      expandedCat === item.category._id
                        ? null
                        : item.category._id,
                    )
                  }
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {item?.category?.category_logo ? (
                    <img
                      src={item.category.category_logo}
                      alt=""
                      className="w-5 h-5 object-contain rounded shrink-0"
                    />
                  ) : (
                    <FiGrid size={16} className="shrink-0 text-gray-400" />
                  )}
                  <span className="flex-1 text-left">
                    {item?.category?.category_name}
                  </span>
                  {item?.sub_categories?.length > 0 && (
                    <FiChevronDown
                      size={14}
                      className={`transition-transform shrink-0 text-gray-400 ${expandedCat === item.category._id ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {expandedCat === item.category._id && (
                  <div className="ml-4 pl-3 border-l-2 border-gray-100 my-1 space-y-0.5">
                    <Link
                      href={`/category/${item.category.category_slug}`}
                      onClick={onClose}
                      className="block px-3 py-1.5 text-xs text-primary font-semibold hover:underline"
                    >
                      View All →
                    </Link>
                    {item.sub_categories.map((sub) => (
                      <div key={sub._id}>
                        <button
                          onClick={() =>
                            setExpandedSub(
                              expandedSub === sub._id ? null : sub._id,
                            )
                          }
                          className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:text-primary rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <span>{sub.sub_category_name}</span>
                          {sub?.child_categories?.length > 0 && (
                            <FiChevronDown
                              size={11}
                              className={`transition-transform ${expandedSub === sub._id ? "rotate-180" : ""}`}
                            />
                          )}
                        </button>
                        {expandedSub === sub._id &&
                          sub?.child_categories?.map((child) => (
                            <Link
                              key={child._id}
                              href={`/category/${item.category.category_slug}/${sub.sub_category_slug}/${child.child_category_slug}`}
                              onClick={onClose}
                              className="block px-5 py-1.5 text-xs text-gray-500 hover:text-primary hover:bg-gray-50 rounded-md"
                            >
                              › {child.child_category_name}
                            </Link>
                          ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-3 bg-gray-50">
          {userInfo?.data ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {userInfo.data.user_image ? (
                    <img
                      src={userInfo.data.user_image}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <FaUserCircle className="text-primary w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {userInfo.data.user_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {userInfo.data.user_phone}
                  </p>
                </div>
              </div>
              <Link
                href="/user-profile?tab=dashboard"
                onClick={onClose}
                className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                My Account
              </Link>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                <TbLogout2 size={15} /> Sign Out
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/sign-in"
                onClick={onClose}
                className="flex-1 text-center py-2.5 bg-primary text-white text-sm font-semibold rounded-lg"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={onClose}
                className="flex-1 text-center py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ─── Main Navbar ───────────────────────────────────────────────────────────────
const Navbar = ({ menuData: menuDataProp }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { products } = useSelector((state) => state.cart);
  const { data: settingsData } = useGetSettingData();
  const { data: userInfo } = useUserInfoQuery();

  const [catOpen, setCatOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [wishlistLength, setWishlistLength] = useState(0);

  const catRef = useRef(null);
  const accountRef = useRef(null);

  const siteData = settingsData?.data?.[0];
  const menuData = menuDataProp?.data || menuDataProp || [];
  const welcomeMessage = siteData?.welcome_message;
  const exploreCategories =
    menuData?.filter?.(
      (item) => item?.category?.explore_category_show === true,
    ) || [];

  // Wishlist sync
  useEffect(() => {
    const update = () => {
      try {
        const wl = JSON.parse(localStorage.getItem("wishlist")) || [];
        setWishlistLength(wl.length);
      } catch {}
    };
    update();
    window.addEventListener("storage", update);
    window.addEventListener("localStorageUpdated", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("localStorageUpdated", update);
    };
  }, []);

  // Outside click
  useEffect(() => {
    const handler = (e) => {
      if (catRef.current && !catRef.current.contains(e.target))
        setCatOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target))
        setAccountOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Route change close all
  useEffect(() => {
    setCatOpen(false);
    setAccountOpen(false);
    setDrawerOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch(`${BASE_URL}/authentication/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        router.push("/");
        window.location.reload();
        toast.success("Logged out successfully");
      }
    } catch {}
  };

  const isActive = (r) => pathname === r;

  const navLinks = [
    { href: "/all-products", label: "All Products" },
    { href: "/new-arrival", label: "New Arrival" },
    ...exploreCategories.map((c) => ({
      href: `/category/${c?.category?.category_slug}`,
      label: c?.category?.category_name,
    })),
    { href: "/orders/order-tracking", label: "Track Order" },
  ];

  return (
    <>
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Announcement */}
      <AnnouncementBar message={welcomeMessage} />

      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 bg-white shadow-sm">
        {/* ── Main bar ── */}
        <div className="border-b border-gray-100 ">
          <Contain>
            <div className="flex items-center h-[60px] gap-3 md:gap-4">
              {/* Mobile: Hamburger */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 shrink-0"
              >
                <FiMenu size={21} />
              </button>

              {/* Logo */}
              <Link href="/" className="shrink-0">
                {siteData?.logo ? (
                  <img
                    src={siteData.logo}
                    alt={siteData?.title || "Logo"}
                    className="h-10 w-auto object-contain"
                  />
                ) : (
                  <span className="text-xl font-bold text-primary">
                    {siteData?.title}
                  </span>
                )}
              </Link>

              {/* Desktop: Categories button */}
              <div className="hidden md:block relative shrink-0" ref={catRef}>
                <button
                  onMouseEnter={() => setCatOpen(true)}
                  onMouseLeave={() => setCatOpen(false)}
                  onClick={() => setCatOpen(!catOpen)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all  ${
                    catOpen
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary"
                  }`}
                >
                  <FiGrid size={15} />
                  <span>All Categories</span>
                  <FiChevronDown
                    size={13}
                    className={`transition-transform ${catOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  onMouseEnter={() => setCatOpen(true)}
                  onMouseLeave={() => setCatOpen(false)}
                >
                  {catOpen && (
                    <CategoriesMegaMenu
                      menuData={menuData}
                      onClose={() => setCatOpen(false)}
                    />
                  )}
                </div>
              </div>

              {/* Desktop: Search bar */}
              <div className="hidden md:flex flex-1 items-center border-2 border-gray-200 hover:border-primary focus-within:border-primary transition-colors bg-white max-w-3xl mx-auto">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors text-left"
                >
                  <FiSearch size={16} className="shrink-0" />
                  <span>Search products here...</span>
                </button>
                <button
                  onClick={() => setSearchOpen(true)}
                  className="bg-primary text-white px-5 py-2.5 text-sm font-semibold hover:bg-primary-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 h-full"
                >
                  <FiSearch size={15} />
                  Search
                </button>
              </div>

              {/* Spacer mobile */}
              <div className="flex-1 md:hidden" />

              {/* Right icons */}
              <div className="flex items-center md:gap-2 gap-0.5">
                {/* Mobile: Search */}
                <button
                  onClick={() => setSearchOpen(true)}
                  className="md:hidden flex flex-col items-center gap-0.5 p-2 text-gray-600 hover:text-primary transition-colors"
                >
                  <FiSearch size={21} />
                </button>

                {/* Mobile + Desktop: Wishlist */}
                <Link
                  href="/wishlist"
                  className="flex flex-col items-center gap-0.5 p-2 text-gray-600 hover:text-primary transition-colors relative group"
                >
                  <FiHeart
                    size={21}
                    className="group-hover:scale-110 transition-transform"
                  />
                  {wishlistLength > 0 && (
                    <span className="absolute top-0.5 right-0.5 bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {wishlistLength}
                    </span>
                  )}
                  <span className="text-[9px] text-gray-400 hidden md:block">
                    Wishlist
                  </span>
                </Link>

                {/* Cart */}
                <Link
                  href="/cart"
                  className="flex flex-col items-center gap-0.5 p-2 text-gray-600 hover:text-primary transition-colors relative group"
                >
                  <FiShoppingCart
                    size={21}
                    className="group-hover:scale-110 transition-transform"
                  />
                  {products?.length > 0 && (
                    <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {products.length}
                    </span>
                  )}
                  <span className="text-[9px] text-gray-400 hidden md:block">
                    Cart
                  </span>
                </Link>

                {/* Account — desktop only */}
                <div className="hidden md:block relative" ref={accountRef}>
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="flex flex-col items-center gap-0.5 p-2 text-gray-600 hover:text-primary transition-colors group"
                  >
                    {userInfo?.data?.user_image ? (
                      <img
                        src={userInfo.data.user_image}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <FiUser
                        size={21}
                        className="group-hover:scale-110 transition-transform"
                      />
                    )}
                    <span className="text-[9px] text-gray-400 whitespace-nowrap">
                      {userInfo?.data
                        ? userInfo.data.user_name?.split(" ")[0]
                        : "Account"}
                    </span>
                  </button>
                  {accountOpen && (
                    <AccountDropdown
                      userInfo={userInfo}
                      onLogout={handleLogout}
                      onClose={() => setAccountOpen(false)}
                    />
                  )}
                </div>
              </div>
            </div>
          </Contain>
        </div>

        {/* ── Desktop second bar ── */}
        <div className="hidden md:block bg-gray-50 border-b border-gray-100">
          <Contain>
            <div className="flex items-center justify-between h-10">
              {/* Nav links */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors rounded-md ${
                      isActive(href)
                        ? "text-primary bg-primary/10"
                        : "text-gray-600 hover:text-primary hover:bg-gray-100"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>

              {/* Right — Offer + Campaign */}
              {/* <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/offer"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-bold hover:from-orange-500 hover:to-red-600 transition-all rounded-sm shadow-sm"
                >
                  <IoMdFlame size={14} />
                  Offer
                </Link>
                <Link
                  href="/campaign"
                  className="flex items-center gap-1.5 px-4 py-1.5 border-2 border-primary text-primary text-xs font-bold hover:bg-primary hover:text-white transition-colors rounded-sm"
                >
                  <FaFire size={12} />
                  Campaign
                </Link>
              </div> */}
            </div>
          </Contain>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        menuData={menuData}
        userInfo={userInfo}
        onLogout={handleLogout}
        siteData={siteData}
      />
    </>
  );
};

export default Navbar;
