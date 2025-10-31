"use client"

import * as React from "react"
import {
  IconArticle,
  IconBrandProducthunt,
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconLogout,
  IconReport,
  IconSearch,
  IconSettings,
  IconShoppingBag,
  IconTicket,
  IconUsers,
  IconShirt,
} from "@tabler/icons-react"
import { useSession } from "next-auth/react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: IconDashboard,
    },
    {
      title: "Products",
      url: "/admin/products",
      icon: IconBrandProducthunt,
    },
    {
      title: "Categories",
      url: "/admin/categories",
      icon: IconFolder,
    },
    {
      title: "Articles",
      url: "/admin/articles",
      icon: IconArticle
    },
    {
      title: "Orders",
      url: "/admin/orders",
      icon: IconShoppingBag,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: IconUsers,
    },
    {
      title: "Teams",
      url: "/admin/teams",
      icon: IconShirt,
    },
    {
      title: "Coupons",
      url: "/admin/coupons",
      icon: IconTicket,
    },
    {
      title: "Discount Rules",
      url: "/admin/discount-rule",
      icon: IconInnerShadowTop,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: IconChartBar,
    },
    {
      title: "Settings",
      url: "/profile",
      icon: IconSettings,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, status } = useSession()

  // Create user object from session data
  const user = session?.user ? {
    name: session.user.name || "User",
    email: session.user.email || "",
    avatar: "/images/default-avatar.png"
  } : {
    name: "Loading...",
    email: "",
    avatar: "/images/default-avatar.png"
  }

  // Determine visible nav items based on role
  const role = session?.user?.role
  const navItems = React.useMemo(() => {
    if (role === "journalist") {
      return data.navMain.filter((item) => item.url === "/admin/articles")
    }
    return data.navMain
  }, [role])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <span className="text-base font-semibold">Goal Mania</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
