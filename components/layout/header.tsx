"use client";

import { Fragment, useState, useEffect, useRef } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
  HeartIcon,
  LanguageIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useLanguageStore } from "@/lib/store/language";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { usePathname, useRouter } from "next/navigation";

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
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInternationalMenuOpen, setIsInternationalMenuOpen] = useState(false);

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

    if (typeof window !== "undefined") {
      // Update cart count
      const cartCount = cart.getItemCount();
      setCartItemCount(cartCount);

      // Update wishlist count
      const wishlistCount = wishlist.items.length;
      setWishlistItemCount(wishlistCount);
    }
  }, [cart, wishlist]);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "it" : "en");
  };

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
      {isShopPage && (
        <div className="accent-bg text-white text-center py-2 text-xs sm:text-sm font-medium">
          Spedizione gratuita per le prossime 24 ore
        </div>
      )}
      <Disclosure as="nav" className="primary-bg text-white shadow">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
              <div className="flex h-14 sm:h-16 justify-between items-center">
                <div className="flex items-center">
                  <div className="flex flex-shrink-0 items-center px-1">
                    <Link href="/" className="flex items-center">
                      <Image
                        src="/images/image.png"
                        alt="Goal Mania Logo"
                        width={28}
                        height={28}
                        className="mr-2 rounded sm:w-8 sm:h-8"
                        style={{ objectFit: "contain" }}
                      />
                      <span className="goalmania-title text-base sm:text-xl font-bold text-white tracking-tight">
                        GOALMANIA
                      </span>
                    </Link>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-2 md:space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-xs md:text-sm font-medium text-white hover:border-accent transition-colors duration-150"
                      >
                        {t(item.name)}
                      </Link>
                    ))}

                    {/* International Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setInternationalOpen(!internationalOpen)}
                        className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-xs md:text-sm font-medium text-white hover:border-white transition-colors duration-150"
                      >
                        <span>Camp. Esteri</span>
                        <ChevronDownIcon
                          className={`ml-1 h-3 w-3 transition-transform ${
                            internationalOpen ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </button>

                      {internationalOpen && (
                        <div className="absolute left-0 z-10 mt-1 w-40 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {internationalNavItems.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="block px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
                              onClick={() => setInternationalOpen(false)}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex items-center space-x-1 sm:space-x-3">
                    <button
                      onClick={toggleLanguage}
                      className="relative p-1.5 sm:p-1 text-white hover:text-gray-200 flex items-center transition-colors duration-150"
                      aria-label="Toggle language"
                    >
                      <LanguageIcon
                        className="h-5 w-5 sm:h-4 sm:w-4 mr-0.5 sm:mr-1"
                        aria-hidden="true"
                      />
                      <span className="text-xs font-medium">
                        {language.toUpperCase()}
                      </span>
                    </button>

                    {/* Search Button with Dropdown - Only visible on desktop */}
                    <div className="hidden sm:block relative">
                      <SearchDropdown />
                    </div>

                    <Link
                      href="/wishlist"
                      className="relative p-1.5 sm:p-1 text-white hover:text-gray-200 transition-colors duration-150"
                      aria-label="Wishlist"
                    >
                      <HeartIcon
                        className="h-5 w-5 sm:h-6 sm:w-6"
                        aria-hidden="true"
                      />
                      {wishlistItemCount > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                          {wishlistItemCount}
                        </span>
                      )}
                    </Link>

                    <Link
                      href="/cart"
                      className="relative p-1.5 sm:p-1 text-white hover:text-gray-200 transition-colors duration-150"
                      aria-label="Cart"
                    >
                      <ShoppingCartIcon
                        className="h-5 w-5 sm:h-6 sm:w-6"
                        aria-hidden="true"
                      />
                      {cartItemCount > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                          {cartItemCount}
                        </span>
                      )}
                    </Link>

                    {/* Profile dropdown - Desktop */}
                    <div className="hidden sm:block ml-1">
                      {session ? (
                        <Menu as="div" className="relative">
                          <Menu.Button className="relative flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white">
                            <span className="sr-only">Open user menu</span>
                            <Image
                              width={32}
                              height={32}
                              className="h-8 w-8 rounded-full object-cover"
                              src={getUserImage(session.user)}
                              alt="Profile"
                            />
                          </Menu.Button>
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    href="/profile"
                                    className={`${
                                      active ? "bg-gray-100" : ""
                                    } block px-4 py-2 text-sm text-gray-700`}
                                  >
                                    {t("profile")}
                                  </Link>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    href="/account/orders"
                                    className={`${
                                      active ? "bg-gray-100" : ""
                                    } block px-4 py-2 text-sm text-gray-700`}
                                  >
                                    {t("orders")}
                                  </Link>
                                )}
                              </Menu.Item>
                              {session.user.role === "admin" && (
                                <Menu.Item>
                                  {({ active }) => (
                                    <Link
                                      href="/admin"
                                      className={`${
                                        active ? "bg-gray-100" : ""
                                      } block px-4 py-2 text-sm text-gray-700`}
                                    >
                                      {t("adminPanel")}
                                    </Link>
                                  )}
                                </Menu.Item>
                              )}
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => signOut()}
                                    className={`${
                                      active ? "bg-gray-100" : ""
                                    } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                                  >
                                    {t("signOut")}
                                  </button>
                                )}
                              </Menu.Item>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      ) : (
                        <Link
                          href="/auth/signin"
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-[#f1803a] hover:bg-[#e06d29] rounded-md transition-colors duration-150"
                        >
                          {t("signIn")}
                        </Link>
                      )}
                    </div>

                    {/* Mobile sign in link */}
                    <div className="sm:hidden">
                      {!session && (
                        <Link
                          href="/auth/signin"
                          className="text-white bg-[#f1803a] hover:bg-[#e06d29] px-3 py-1 rounded-md text-xs font-medium transition-colors duration-150"
                        >
                          {t("signIn")}
                        </Link>
                      )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="sm:hidden -mr-1">
                      <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-1.5 text-white hover:text-gray-200 focus:outline-none">
                        <span className="sr-only">Open main menu</span>
                        {open ? (
                          <XMarkIcon
                            className="block h-6 w-6"
                            aria-hidden="true"
                          />
                        ) : (
                          <Bars3Icon
                            className="block h-6 w-6"
                            aria-hidden="true"
                          />
                        )}
                      </Disclosure.Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              {/* Mobile search field */}
              <div className="px-2 pt-2 pb-1">
                <form onSubmit={handleMobileSearch} className="relative">
                  <input
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
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
                  >
                    {t(item.name)}
                  </Link>
                ))}

                {/* International submenu for mobile */}
                <Disclosure>
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-700">
                        <span>Camp. Esteri</span>
                        <ChevronDownIcon
                          className={`${
                            open ? "rotate-180" : ""
                          } h-4 w-4 transition-transform`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="px-4 py-1 text-sm">
                        <div className="space-y-1">
                          {internationalNavItems.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="block py-1.5 text-gray-300 hover:text-white"
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              </div>

              {/* Mobile profile section */}
              {session && (
                <div className="border-t border-gray-700 px-3 py-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Image
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                        src={getUserImage(session.user)}
                        alt="Profile"
                      />
                    </div>
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
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
                    >
                      {t("signOut")}
                    </button>
                  </div>
                </div>
              )}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </header>
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 sm:p-1 text-white hover:text-gray-200 transition-colors duration-150"
        aria-label="Search"
      >
        <MagnifyingGlassIcon
          className="h-5 w-5 sm:h-4 sm:w-4"
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-md shadow-lg py-1 z-10">
          <form onSubmit={handleSearch} className="px-3 py-2">
            <div className="relative">
              <input
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
              <button
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center pr-2"
              >
                <span className="text-xs text-indigo-600 font-medium">
                  Cerca
                </span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
