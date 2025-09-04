/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Fragment, useState, useEffect, useRef } from "react";
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
  HeartIcon,
  LanguageIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { BsCart } from "react-icons/bs";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useLanguage } from "@/lib/utils/language";
import { useI18n } from "@/lib/hooks/useI18n";
import { usePathname, useRouter } from "next/navigation";
import ShopNav from "@/app/_components/ShopNav";
import ShopSearchBar from "@/app/_components/ShopSearchBar";

// Shadcn components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, UserRound } from "lucide-react";

// Use this as a proper type
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  role?: string;
}

// Helper function to safely get user image
const getUserImage = (user: any): string => {
  return user?.image || "/images/default-avatar.png";
};

const navigation = [
  { name: "navigation.home", href: "/" },
  { name: "navigation.news", href: "/news" },
  { name: "navigation.transfer", href: "/transfer" },
  { name: "navigation.serieA", href: "/serieA" },
  { name: "navigation.results", href: "/risultati" },
  { name: "navigation.fantasyFootball", href: "/fantasyFootball" },
  { name: "navigation.shop", href: "/shop" },
];

const internationalNavItems = [
  { name: "La Liga", href: "/international/laliga" },
  { name: "Premier League", href: "/international/premierLeague" },
  { name: "Bundesliga", href: "/international/bundesliga" },
  { name: "Ligue 1", href: "/international/ligue1" },
  { name: "Serie A", href: "/international/serieA" },
  { name: "Leagues Overview", href: "/leagues-overview" },
  { name: "Altri campionati", href: "/international/other" },
];

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [internationalOpen, setInternationalOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const { data: session } = useSession();
  const cart = useCartStore();
  const wishlist = useWishlistStore();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [wishlistItemCount, setWishlistItemCount] = useState(0);
  const { language, toggleLanguage } = useLanguage();
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  // Check if current page is a shop page
  const isShopPage =
    pathname?.includes("/shop") ||
    pathname?.includes("/products") ||
    pathname?.includes("/cart") ||
    pathname?.includes("/checkout");

  // Add border if not on shop page
  const showBorder = pathname !== "/shop";

  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined" && session) {
      // Update cart count
      const cartCount = cart.getItemCount();
      setCartItemCount(cartCount);

      // Update wishlist count
      const wishlistCount = wishlist.items.length;
      setWishlistItemCount(wishlistCount);
    } else {
      setCartItemCount(0);
      setWishlistItemCount(0);
    }
  }, [cart, wishlist, session]);

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileSearchQuery.trim()) return;

    router.push(`/search?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
    setMobileSearchQuery("");
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-white"
      } ${showBorder ? "border-b-5 border-orange-500" : ""}`}
    >
      <nav className="primary-bg text-white shadow">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 justify-between items-center">
            {/* Logo and Navigation */}
            <div className="flex items-center">
              <div className="flex flex-shrink-0 items-center px-1 ">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/images/recentUpdate/desktop-logo.png"
                    // src="/logos/brand_logo.png"
                    alt="Goal Mania Logo"
                    width={80}
                    height={80}
                    className="ml-3"
                    style={{ objectFit: "contain" }}
                  />
                  {/* goalmania-title */}
                  <span className="goalmania-title -ml-4 md:hidden text-base sm:text-xl tracking-tight font-bold text-white ">
                    GOAL <span className="text-[#FF7A00]">MANIA</span> 
                  </span>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-2 md:space-x-4 items-center">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="inline-flex items-center justify-center border-b-2 border-transparent px-1 pt-1 text-xs md:text-sm font-medium text-white hover:border-accent transition-colors duration-150 min-h-[32px] leading-none whitespace-nowrap"
                  >
                    {t(item.name)}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center">
              <div className="flex items-center space-x-1 sm:space-x-3">
                {/* Language Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleLanguage}
                  className="text-white hover:text-gray-200 hover:bg-transparent"
                  aria-label="Toggle language"
                >
                  <span className="text-xs font-medium">
                    {language.toUpperCase()}
                  </span>
                </Button>

                {/* Search Button with Dropdown - Only visible on desktop */}
                <div className="hidden sm:block relative">
                  <SearchDropdown />
                </div>

                <div className="hidden lg:block">
                  {/* International Dropdown */}
                  <DropdownMenu
                    open={internationalOpen}
                    onOpenChange={setInternationalOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="inline-flex items-center justify-center bg-white border-b-2 border-transparent px-1 pt-1 text-xs md:text-sm font-medium text-black hover:border-white transition-colors duration-150  h-auto p-0 min-h-[32px] leading-none"
                      >
                        <img
                          src={"/images/recentUpdate/world.png"}
                          className="w-4 h-4"
                          alt=""
                        />
                        <span className="text-sm">
                          {language === "en" ? "International" : "Camp. Esteri"}
                        </span>
                        <ChevronDownIcon
                          className={`ml-1 h-3 w-3 transition-transform ${
                            internationalOpen ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40">
                      {internationalNavItems.map((item) => (
                        <DropdownMenuItem key={item.name} asChild>
                          <Link
                            href={item.href}
                            onClick={() => setInternationalOpen(false)}
                          >
                            {item.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Wishlist */}
                <Link href="/wishlist" className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white cursor-pointer hover:text-gray-200 hover:bg-transparent"
                    aria-label="Wishlist"
                  >
                    <img src={"/images/recentUpdate/heart-store.png"} alt="" />
                    {/* <HeartIcon className="h-5 w-5 sm:h-6 sm:w-6 md:w-14 md:h-14 lg:w-20  text-[#FF7A00]" /> */}
                    {session && wishlistItemCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
                      >
                        {wishlistItemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* Cart */}
                <Link href="/cart" className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-whit cursor-pointer hover:text-gray-200 hover:bg-transparent"
                    aria-label="Cart"
                  >
                    <img
                      src={"/images/recentUpdate/cart-basket.png"}
                      className="w-6 h-6"
                      alt=""
                    />

                    {/* <ShoppingCartIcon className="h-5 w-5 sm:h-6 sm:w-6" /> */}
                    {session && cartItemCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
                      >
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* Profile dropdown - Desktop */}
                <div className="hidden sm:block ml-1">
                  {session ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="relative h-8 w-8 rounded-full p-0"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={getUserImage(session.user)}
                              alt="Profile"
                            />
                            <AvatarFallback>
                              <UserIcon className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {session.user.name}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {session.user.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="flex items-center">
                            <UserIcon className="mr-2 h-4 w-4" />
                            {t("profile")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/account/orders"
                            className="flex items-center"
                          >
                            <ShoppingCartIcon className="mr-2 h-4 w-4" />
                            {t("auth.myOrders")}
                          </Link>
                        </DropdownMenuItem>
                        {session.user.role === "admin" && (
                          <DropdownMenuItem asChild>
                            <Link href="/admin" className="flex items-center">
                              <Cog6ToothIcon className="mr-2 h-4 w-4" />
                              {t("adminPanel")}
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {session.user.role === "journalist" && (
                          <DropdownMenuItem asChild>
                            <Link
                              href="/admin/articles"
                              className="flex items-center"
                            >
                              <PencilIcon className="mr-2 h-4 w-4" />
                              {t("authorPanel")}
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut()}>
                          <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
                          {t("signOut")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <div className="bg-transparent border rounded-full flex gap-1 px-5 py-3 border-[#FF7A00]">
                      <button>
                        <Link href="/auth/signin">{t("Login")}</Link>
                      </button>
                      <button>
                        <span className="mr-1">/</span>
                        <Link href="/auth/signup">{t("Sign-up")}</Link>
                      </button>

                      <ArrowRight className="ml-2" />
                    </div>

                    //   <div className="bg-transparent flex gap-3 px-3 border-[#FF7A00]">
                    //   <Button
                    //   size="sm"
                    //   asChild
                    // >
                    //   <Link href="/auth/signin">
                    //     {t("signIn")}
                    //   </Link>
                    // </Button>
                    //   <Button
                    //   size="sm"
                    //   asChild
                    // >
                    //   <Link href="/auth/signin">
                    //     {t("signIn")}
                    //   </Link>
                    // </Button>
                    //  </div>
                  )}
                </div>

                {/* Mobile sign in link */}
                <div className="sm:hidden">
                  {!session && (
                    <Button variant="orange" size="sm" asChild>
                      <Link href="/auth/signin">{t("signIn")}</Link>
                    </Button>
                  )}
                </div>

                {/* Mobile menu button */}
                <div className="sm:hidden -mr-1">
                  <MobileMenu
                    session={session}
                    navigation={navigation}
                    internationalNavItems={internationalNavItems}
                    mobileSearchQuery={mobileSearchQuery}
                    setMobileSearchQuery={setMobileSearchQuery}
                    handleMobileSearch={handleMobileSearch}
                    t={t}
                    getUserImage={getUserImage}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {isShopPage ? (
        <>
          <ShopNav />
          <div className="accent-bg text-white text-center py-2 text-xs sm:text-sm font-medium">
            {t("sale")}
          </div>
        </>
      ) : null}
    </header>
  );
}

// Mobile Menu Component using Shadcn Sheet
function MobileMenu({
  session,
  navigation,
  internationalNavItems,
  mobileSearchQuery,
  setMobileSearchQuery,
  handleMobileSearch,
  t,
  getUserImage,
}: any) {
  const [internationalOpen, setInternationalOpen] = useState(false);

  return (
    <Sheet>
      <div className="absolute left-0 top-2 mr-10">
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-gray-200 hover:bg-transparent"
          >
            {/* <Bars3Icon className="h-6 w-6" /> */}
            <img src="/images/recentUpdate/harmburger.png" alt="" />
            <span className="sr-only">Open main menu</span>
          </Button>
        </SheetTrigger>
      </div>

      <SheetContent
        side="right"
        className="w-[300px] sm:w-[400px] bg-gray-900 text-white"
      >
        <SheetHeader>
          <SheetTitle className="text-white">Menu</SheetTitle>
        </SheetHeader>

        {/* Mobile search field */}
        <div className="px-2 pt-4 pb-2">
          <form onSubmit={handleMobileSearch} className="relative">
            <Input
              type="text"
              value={mobileSearchQuery}
              onChange={(e) => setMobileSearchQuery(e.target.value)}
              placeholder={t("search")}
              className="w-full py-2 pl-8 pr-3 text-sm text-gray-900 bg-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <MagnifyingGlassIcon
              className="absolute left-2 top-2.5 h-4 w-4 text-gray-500"
              aria-hidden="true"
            />
          </form>
        </div>

        {/* Mobile nav links */}
        <div className="space-y-1 px-2 pb-3 pt-2">
          {navigation.map((item: any) => (
            <Link
              key={item.name}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 leading-none"
            >
              {t(item.name)}
            </Link>
          ))}

          {/* International submenu for mobile */}
          <DropdownMenu
            open={internationalOpen}
            onOpenChange={setInternationalOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 h-auto"
              >
                <span>Camp. Esteri</span>
                <ChevronDownIcon
                  className={`${
                    internationalOpen ? "rotate-180" : ""
                  } h-4 w-4 transition-transform`}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              {internationalNavItems.map((item: any) => (
                <DropdownMenuItem key={item.name} asChild>
                  <Link
                    href={item.href}
                    onClick={() => setInternationalOpen(false)}
                    className="block py-1.5 text-gray-300 hover:text-white"
                  >
                    {item.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile profile section */}
        {session && (
          <div className="border-t border-gray-700 px-3 py-3 mt-4">
            <div className="flex items-center">
              <Avatar className="h-10 w-10">
                <AvatarImage src={getUserImage(session.user)} alt="Profile" />
                <AvatarFallback>
                  {/* <UserIcon className="h-4 w-4" /> */}
                  <UserRound className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <div className="text-sm font-medium text-white">
                  {session.user.name}
                </div>
                <div className="text-xs text-gray-300">
                  {session.user.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/profile"
                className="block rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
              >
                {t("profile")}
              </Link>
              <Link
                href="/account/orders"
                className="block rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
              >
                {t("orders")}
              </Link>
              {session.user.role === "admin" && (
                <Link
                  href="/admin"
                  className="block rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                  {t("adminPanel")}
                </Link>
              )}
              <Button
                variant="ghost"
                onClick={() => signOut()}
                className="block w-full text-left rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 h-auto"
              >
                {t("signOut")}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function SearchDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div ref={searchRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="text-white hover:text-gray-200 hover:bg-transparent"
        aria-label="Search"
      >
        <MagnifyingGlassIcon className="h-5 w-5 sm:h-4 sm:w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-md shadow-lg py-1 z-10">
          <form onSubmit={handleSearch} className="px-3 py-2">
            <div className="relative">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca..."
                className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm leading-6"
                autoFocus
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon
                  className="h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="absolute inset-y-0 right-0 flex items-center pr-2 h-auto"
              >
                <span className="text-xs text-indigo-600 font-medium">
                  Cerca
                </span>
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
