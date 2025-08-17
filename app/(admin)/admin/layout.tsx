"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Squares2X2Icon,
  ShoppingBagIcon,
  NewspaperIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Squares2X2Icon },
  { name: "Products", href: "/admin/products", icon: ShoppingBagIcon },
  { name: "Articles", href: "/admin/articles", icon: NewspaperIcon },
  { name: "Orders", href: "/admin/orders", icon: ClipboardDocumentListIcon },
  { name: "Users", href: "/admin/users", icon: UsersIcon },
  { name: "Coupons", href: "/admin/coupons", icon: TicketIcon },
  { name: "Analytics", href: "/admin/analytics", icon: ChartBarIcon },
  { name: "Settings", href: "/profile", icon: Cog6ToothIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return <>{children}</>;
}
