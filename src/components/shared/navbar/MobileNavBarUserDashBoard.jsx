"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FaRegUser, FaRegUserCircle, FaUserAlt } from "react-icons/fa";
import { BiCategoryAlt } from "react-icons/bi";
import { RiHome6Line } from "react-icons/ri";
import { BsCart2 } from "react-icons/bs";

import { TbTruckDelivery } from "react-icons/tb";

import Link from "next/link";
import { BiPurchaseTag } from "react-icons/bi";
import { GiFlame } from "react-icons/gi";
import { IoSettingsOutline } from "react-icons/io5";

import { MdOutlineHome } from "react-icons/md";

import { TbJewishStar, TbLogout2 } from "react-icons/tb";
import { SlUserFollowing } from "react-icons/sl";

import { AiOutlineProduct } from "react-icons/ai";
import { VscDashboard } from "react-icons/vsc";
import { useUserInfoQuery } from "@/redux/feature/auth/authApi";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";

const actionContents = [
  { name: "dashboard", icon: MdOutlineHome, label: "Dashboard" },
  { name: "wishlist", icon: TbJewishStar, label: "WishList" },
  {
    name: "purchase-history",
    icon: BiPurchaseTag,
    label: "Purchase History",
  },
  // {
  //   name: "offer-history",
  //   icon: GiFlame,
  //   label: "Offer History",
  // },

  { name: "review", icon: SlUserFollowing, label: "Review" },

  {
    name: "profile-setting",
    icon: IoSettingsOutline,
    label: "Profile Setting",
  },
];

export default function MobileNavBarUserDashBoard() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();
  const [actionButtonActive, setActionButtonActive] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const isActive = (route) => {
    if (!origin) return false; // Prevent running on SSR

    const url = new URL(route, origin);
    return (
      pathname === url.pathname &&
      searchParams.get("tab") === url.searchParams.get("tab")
    );
  };
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeNavButton, setActiveNavButton] = useState("dashboard");
  const { products } = useSelector((state) => state.cart);

  const {
    data: userInfo,
    isLoading: userGetLoading,
    refetch,
  } = useUserInfoQuery();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogOut = () => {
    // Remove the token from cookies
    Cookies.remove("fruit_snacks_token");

    // Redirect to the home page
    router.push("/");
    window.location.reload();
  };

  return (
    <div className="fixed -bottom-1 left-0 right-0 bg-white shadow-lg flex items-center justify-around py-2 md:hidden z-50  h-16">
      <Link
        className={`flex flex-col items-center font-medium  hover:text-primary-500  ${
          isActive("/") ? "text-primary" : "text-text-semiLight"
        }`}
        href={"/"}
      >
        {" "}
        <RiHome6Line size={24} />
        {/* <span className="text-xs">Home</span> */}
      </Link>
      <Link
        className={`flex flex-col items-center font-medium  hover:text-primary-500  ${
          isActive("/all-products") ? "text-primary" : "text-text-semiLight"
        }`}
        href={"/all-products"}
      >
        <AiOutlineProduct size={24} />

        {/* <span className="text-xs">All Products</span> */}
      </Link>

      {/* <Link href="/cart">
        <div className="w-12 h-12 bottom-3  flex items-center justify-center  relative text-white ">
          <BsCart2 size={24} className="text-black" />
          <sup className="text-white w-5 h-5 rounded-full flex items-center justify-center absolute top-0 right-0 bg-red-600 ">
            {products?.length || 0}
          </sup>
        </div>
        <span className="text-xs">Orders</span>
      </Link> */}
      {/* 
      <Link
        href="/user-profile?tab=purchase-history"
        className={`flex flex-col items-center font-medium  hover:text-primary-500  ${
          isActive("/user-profile?tab=purchase-history")
            ? "text-primary"
            : "text-text-semiLight"
        }`}
      >
        <TbTruckDelivery size={24} />
        <span className="text-xs">Orders</span>
      </Link> */}

      <Link
        href="/shop"
        className={`flex flex-col items-center   hover:text-primary-500  ${
          isActive("/shop") ? "text-primary" : "text-text-default"
        }`}
      >
        {/* <TbTruckDelivery size={24} /> */}
        <span className="text-lg font-bold ">Shop</span>
      </Link>

      <Link
        href="/checkout"
        className={`flex flex-col items-center font-medium  hover:text-primary-500  ${
          isActive("/user-profile?tab=purchase-history")
            ? "text-primary"
            : "text-text-semiLight"
        }`}
      >
        <div className="relative">
          <BsCart2 size={24} className="text-black" />
          <sup className="text-white w-5 h-5 rounded-full flex items-center justify-center absolute -top-2 -right-2 bg-red-600 ">
            {products?.length || 0}
          </sup>
        </div>
        {/* <span className="text-xs">Cart</span> */}
      </Link>
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center flex-col">
          <FaRegUser
            size={24}
            className="text-black cursor-pointer"
            onClick={toggleDropdown}
          />
          {/* <span className="text-xs">Settings</span> */}
        </div>
        {showDropdown && (
          <div
            className="absolute bottom-[50px] -right-3 transition-all duration-500 flex flex-col bg-white shadow-xl py-4 px-2.5   z-40 lg:hidden modal-container border "
            onClick={() => setShowDropdown(false)}
          >
            {userInfo?.data ? (
              <>
                {actionContents?.map((item, index) => (
                  <Link
                    key={index}
                    onClick={() => setActionButtonActive(!actionButtonActive)}
                    className={`hover:bg-primary-300 hover:text-white flex items-center gap-3 font-medium py-1 whitespace-nowrap px-4 w-full  m-1 ${
                      isActive(`/user-profile?tab=${item.name}`)
                        ? "bg-primary text-white"
                        : ""
                    }`}
                    href={`/user-profile?tab=${item.name}`}
                  >
                    <span className="text-xl sm:text-2xl">
                      <item.icon size={20} />
                    </span>
                    <span className={`text-xs`}>{item?.label}</span>
                  </Link>
                ))}
                <div className="mt-3 border-t border-gray-200 pt-[5px]">
                  <button
                    className="flex items-center justify-center gap-[7px]   p-[8px]  py-[3px] text-[1rem] text-red-500 bg-red-100 font-medium w-full"
                    type="button"
                    onClick={handleLogOut}
                  >
                    <TbLogout2 className="font-bold" size={25} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex  flex-col items-start ">
                <Link
                  href="/sign-in"
                  className={`text-lg px-2 font-medium  hover:text-primary-500  ${
                    isActive("/sign-in")
                      ? "text-primary"
                      : "text-text-semiLight"
                  }`}
                >
                  Login
                </Link>

                <Link
                  href="/sign-up"
                  className={`text-lg px-2 font-medium  hover:text-primary-500  ${
                    isActive("/sign-up")
                      ? "text-primary"
                      : "text-text-semiLight"
                  }`}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
