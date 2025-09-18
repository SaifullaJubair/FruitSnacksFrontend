"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FiMenu,
  FiSearch,
  FiHeart,
  FiShoppingCart,
  FiUser,
  FiSun,
  FiMoon,
  FiX,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import MobileMenu from "./MobileMenu";
import useGetSettingData from "@/components/lib/getSettingData";

const mockProducts = [
  {
    id: 1,
    name: "Premium Leather Oxford Shoes",
    image: "/oxford-shoes.jpg",
    price: "$299",
    category: "Footwear",
  },
  {
    id: 2,
    name: "Classic Leather Messenger Bag",
    image: "/brown-leather-messenger-bag.png",
    price: "$199",
    category: "Bags",
  },
  {
    id: 3,
    name: "Casual Sneakers",
    image: "/diverse-sneaker-collection.png",
    price: "$149",
    category: "Footwear",
  },
];

// const featureCategories = [
//   { name: "New Arrivals", slug: "new-arrivals" },
//   { name: "Best Sellers", slug: "best-sellers" },
//   { name: "Sale Items", slug: "sale" },
// ];

function NavItem({ href, children, isActive, className = "" }) {
  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
        isActive ? "text-primary border-b-2 border-primary" : "text-foreground",
        className
      )}
    >
      {children}
    </Link>
  );
}

function SearchDropdown({ isOpen, onClose, searchTerm, setSearchTerm }) {
  const filteredProducts = mockProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
      {searchTerm && (
        <>
          {filteredProducts.length > 0 ? (
            <div className="p-2">
              <div className="text-xs text-muted-foreground mb-2">Products</div>
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="flex items-center gap-3 p-2 hover:bg-accent rounded-md"
                  onClick={onClose}
                >
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {product.category}
                    </div>
                    <div className="text-sm font-semibold text-primary">
                      {product.price}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No products found for "{searchTerm}"
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CategoryDropdown({ categories, isOpen, onClose }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubCategory, setActiveSubCategory] = useState(null);

  if (!isOpen) return null;

  return (
    <div
      className="absolute top-full left-0 z-50 bg-background border border-border shadow-lg rounded-md"
      onMouseLeave={onClose}
    >
      <div className="flex">
        {/* Main Categories */}
        <div className="w-64 border-r border-border">
          <div className="p-2">
            <div className="text-xs text-muted-foreground mb-2">Categories</div>
            {categories.map((category) => (
              <div
                key={category._id}
                className={cn(
                  "flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer",
                  activeCategory?._id === category._id && "bg-accent"
                )}
                onMouseEnter={() => {
                  setActiveCategory(category);
                  setActiveSubCategory(null);
                }}
              >
                <Link
                  href={`/category/${category.category.category_slug}`}
                  className="flex items-center gap-2 flex-1"
                  onClick={onClose}
                >
                  <img
                    src={category.category.category_logo || "/placeholder.svg"}
                    alt={category.category.category_name}
                    className="w-6 h-6 object-cover rounded"
                  />
                  <span className="text-sm">
                    {category.category.category_name}
                  </span>
                </Link>
                {category.sub_categories.length > 0 && (
                  <FiChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sub Categories */}
        {activeCategory && activeCategory.sub_categories.length > 0 && (
          <div className="w-64 border-r border-border">
            <div className="p-2">
              <div className="text-xs text-muted-foreground mb-2">
                Subcategories
              </div>
              {activeCategory.sub_categories.map((subCategory) => (
                <div
                  key={subCategory._id}
                  className={cn(
                    "flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer",
                    activeSubCategory?._id === subCategory._id && "bg-accent"
                  )}
                  onMouseEnter={() => setActiveSubCategory(subCategory)}
                >
                  <Link
                    href={`/category/${activeCategory.category.category_slug}/${subCategory.sub_category_slug}`}
                    className="flex-1 text-sm"
                    onClick={onClose}
                  >
                    {subCategory.sub_category_name}
                  </Link>
                  {subCategory.child_categories &&
                    subCategory.child_categories.length > 0 && (
                      <FiChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Child Categories */}
        {activeSubCategory &&
          activeSubCategory.child_categories &&
          activeSubCategory.child_categories.length > 0 && (
            <div className="w-64">
              <div className="p-2">
                <div className="text-xs text-muted-foreground mb-2">Items</div>
                {activeSubCategory.child_categories.map((childCategory) => (
                  <Link
                    key={childCategory._id}
                    href={`/category/${activeCategory.category.category_slug}/${activeSubCategory.sub_category_slug}/${childCategory.child_category_slug}`}
                    className="block p-2 hover:bg-accent rounded-md text-sm"
                    onClick={onClose}
                  >
                    {childCategory.child_category_name}
                  </Link>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

export default function Navbar({ menuData }) {
  const [isDark, setIsDark] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartCount, setCartCount] = useState(3);
  const [wishlistCount, setWishlistCount] = useState(5);

  const featureCategories = menuData
    .filter((item) => item.category.feature_category_show === true)
    .map((item) => ({
      name: item?.category?.category_name,
      slug: item?.category?.category_slug,
    }));

  console.log(featureCategories);

  // explore_category_show === true
  const exploreCategories = menuData
    .filter((item) => item?.category?.explore_category_show === true)
    .map((item) => ({
      name: item?.category?.category_name,
      slug: item?.category?.category_slug,
    }));
  const pathname = usePathname();
  const searchRef = useRef(null);
  const categoryRef = useRef(null);
  console.log(menuData);
  // Theme toggle
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const { data: settingsData } = useGetSettingData();

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 max-w-[98%] mx-auto">
        <div className=" px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <img
                  src={settingsData?.data[0]?.logo}
                  className="h-16 p-1"
                  alt=""
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {/* Categories Dropdown */}
              <div className="relative" ref={categoryRef}>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                  onMouseEnter={() => setIsCategoryOpen(true)}
                >
                  <FiMenu className="w-4 h-4" />
                  All Categories
                  <FiChevronDown className="w-4 h-4" />
                </Button>
                <CategoryDropdown
                  categories={menuData}
                  isOpen={isCategoryOpen}
                  onClose={() => setIsCategoryOpen(false)}
                />
              </div>

              {/* Navigation Links */}
              <NavItem
                href="/all-products"
                isActive={pathname === "/all-products"}
              >
                All Products
              </NavItem>

              {featureCategories?.map((category) => (
                <NavItem
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  isActive={pathname === `/category/${category.slug}`}
                >
                  {category.name}
                </NavItem>
              ))}
            </div>

            {/* Search Bar */}
            <div
              className="hidden md:flex flex-1 max-w-md mx-6 relative"
              ref={searchRef}
            >
              <div className="relative w-full">
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  className="pl-10 pr-4"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              <SearchDropdown
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDark(!isDark)}
                className="hidden md:flex"
              >
                {isDark ? (
                  <FiSun className="w-4 h-4" />
                ) : (
                  <FiMoon className="w-4 h-4" />
                )}
              </Button>

              {/* Wishlist */}
              <Link href="/wishlist" className="hidden md:flex relative">
                <Button variant="ghost" size="sm">
                  <FiHeart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Cart */}
              <Link href="/cart" className="hidden md:flex relative">
                <Button variant="ghost" size="sm">
                  <FiShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* User Account */}
              <Link href="/account" className="hidden md:flex">
                <Button variant="ghost" size="sm">
                  <FiUser className="w-5 h-5" />
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <FiMenu className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        pathname={pathname}
      />
    </>
  );
}
