"use client";

import { useState, useEffect } from "react";
import {
  ChevronDownIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useLanguage } from "@/lib/utils/language";
import { useI18n } from "@/lib/hooks/useI18n";
import { usePathname } from "next/navigation";

// Shadcn components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Globe,
  Heart,
  MenuIcon,
  ShoppingBag,
  X,
} from "lucide-react";

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  role?: string;
}

const getUserImage = (user: any): string => {
  return user?.image || "/images/default-avatar.png";
};

export function Header() {
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const cart = useCartStore();
  const wishlist = useWishlistStore();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [wishlistItemCount, setWishlistItemCount] = useState(0);
  const { language, toggleLanguage } = useLanguage();
  const { t } = useI18n();
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined" && session) {
      setCartItemCount(cart.getItemCount());
      setWishlistItemCount(wishlist.items.length);
    } else {
      setCartItemCount(0);
      setWishlistItemCount(0);
    }
  }, [cart, wishlist, session]);

  const languageNames: Record<string, string> = {
    en: "English",
    it: "Italiano",
  };

  const navigation = [
    { name: t("nav.home"), href: "/" },
    {
      name: t("nav.category"),
      href: "/category",
      hasDropdown: true,
      subItems: [
        { name: t("nav.laliga"), href: "/international/laliga" },
        { name: t("nav.premierLeague"), href: "/international/premierLeague" },
        { name: t("nav.bundesliga"), href: "/international/bundesliga" },
        { name: t("nav.ligue1"), href: "/international/ligue1" },
        { name: t("nav.serieA"), href: "/international/serieA" },
        { name: t("nav.leaguesOverview"), href: "/leagues-overview" },
        { name: t("nav.otherLeagues"), href: "/international/other" },
      ],
    },
    { name: t("nav.articles"), href: "/articles" },
    { name: t("nav.info"), href: "/info" },
    { name: t("nav.about"), href: "/about" },
    { name: t("nav.contact"), href: "/contact" },
    { name: t("nav.shop"), href: "/shop" },
  ];

  if (!mounted) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 md:bg-[#0B1C2C] bg-[#000000] h-[90px] flex justify-center items-center font-mulish">
      <nav className="container mx-auto flex items-center justify-between px-3 py-2">
        {/* Logo & Mobile Menu Button */}
        <div className="flex items-center ">
          {/* Mobile toggle button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpenMenu(true)}
              className="text-white"
            >
              <MenuIcon className="h-7 w-7" />
            </Button>
          </div>
          <div className=" flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/recentUpdate/desktop-logo.png"
                alt="Logo"
                width={60}
                height={60}
                className="w-[60px] h-[60px] object-contain"
              />
            </Link>
            <div className=" text-white flex items-center">
              Goal<span className=" text-[#FF7A00]">Mania</span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex space-x-6 text-base items-center">
          {navigation.map((item) =>
            item.hasDropdown ? (
              <DropdownMenu key={item.name}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`flex items-center hover:bg-transparent cursor-pointer ${
                      pathname === item.href
                        ? "text-[#FF7A00]"
                        : "text-white hover:text-[#FF7A00]"
                    }`}
                  >
                    {item.name}
                    <ChevronDownIcon className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white text-black">
                  {item.subItems?.map((sub) => (
                    <DropdownMenuItem key={sub.name} asChild>
                      <Link href={sub.href}>{sub.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className={
                  pathname === item.href
                    ? "text-[#FF7A00]"
                    : "text-white hover:text-[#FF7A00]"
                }
              >
                {item.name}
              </Link>
            )
          )}
        </div>

        <div className="flex items-center ">
          {/* Language Switch */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="bg-white text-[#0A1A2F] rounded-full cursor-pointer hidden md:flex"
          >
            <Globe className="w-4 h-4 mr-1" />
            {languageNames[language] || language}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="bg-white text-[#0A1A2F] uppercase rounded-full cursor-pointer md:hidden flex"
          >
            <Globe className="w-4 h-4 mr-1" />
            {language}
          </Button>

          {/* Wishlist */}
          <Link href="/wishlist" className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-[#FF7A00]"
            >
              <img
                src="/images/recentUpdate/heart-store.png"
                alt="Wishlist"
                className="w-6 h-5 md:flex hidden"
              />
              <Heart size={15} className="md:hidden flex" />

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
              className="text-white hover:text-[#FF7A00]"
            >
              <img
                src="/images/recentUpdate/cart-basket.png"
                className="w-5 h-5 hidden md:flex"
                alt="Cart"
              />
              <ShoppingBag size={15} className="md:hidden flex" />
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

          {/* Profile / Login */}
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
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.user.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">{t("profile")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/orders">{t("auth.myOrders")}</Link>
                </DropdownMenuItem>
                {session.user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">{t("adminPanel")}</Link>
                  </DropdownMenuItem>
                )}
                {session.user.role === "journalist" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/articles">{t("authorPanel")}</Link>
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
            <div className="border-[1px] border-[#FF7A00] rounded-full hidden md:px-4 px-2 md:text-base  py-1 md:flex items-center gap-1 text-white">
              <Link href="/auth/signin" className="hover:text-[#FF7A00]">
                {t("Login")}
              </Link>
              <span>/</span>
              <Link href="/auth/signup" className="hover:text-[#FF7A00]">
                {t("Sign-up")}
              </Link>
              <ArrowRight className="ml-2 w-4 h-4 " />
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {openMenu && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden">
          <div className="absolute top-0 left-0 w-3/4 max-w-sm h-full bg-[#0B1C2C] p-6 flex flex-col gap-6 text-white">
            {/* Close Button */}
            <div className="flex justify-between items-center">
              <Image
                src="/images/recentUpdate/desktop-logo.png"
                alt="Logo"
                width={50}
                height={50}
                className="object-contain"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpenMenu(false)}
                className="text-white"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex flex-col gap-4 text-lg">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setOpenMenu(false)}
                    className={
                      pathname === item.href
                        ? "text-[#FF7A00]"
                        : "hover:text-[#FF7A00]"
                    }
                  >
                    {item.name}
                  </Link>
                  {item.hasDropdown && (
                    <div className="ml-4 mt-2 flex flex-col gap-2">
                      {item.subItems?.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          onClick={() => setOpenMenu(false)}
                          className={
                            pathname === sub.href
                              ? "text-[#FF7A00] text-sm"
                              : "text-white hover:text-[#FF7A00] text-sm"
                          }
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="border-[1px] border-[#FF7A00] rounded-full md:hidden md:px-4 px-2 md:text-base  py-1 justify-center flex items-center gap-1 text-white">
              <Link href="/auth/signin" className="hover:text-[#FF7A00]">
                {t("Login")}
              </Link>
              <span>/</span>
              <Link href="/auth/signup" className="hover:text-[#FF7A00]">
                {t("Sign-up")}
              </Link>
              <ArrowRight className="ml-2 w-4 h-4 " />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
