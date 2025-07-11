"use client"

import * as React from "react"
import {
  IconDashboard,
  IconShoppingBag,
  IconShoppingCart,
  IconPackage,
  IconTruckDelivery,
  IconUsers,
  IconChartBar,
  IconDiscount,
  IconSpeakerphone,
  IconSettings,
  IconHelp,
  IconLogout,
  IconWallet,
  IconStar,
  IconMessage,
  IconCategory,
  IconBrandAppgallery,
  IconFileReport,
  IconBuildingStore,
  IconCashBanknote,
  IconSearch,
  IconUserCog,
} from "@tabler/icons-react"

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
  user: {
    name: "Store Admin",
    email: "admin@example.com",
    avatar: "/avatars/admin.jpg",
    role: "Super Admin",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: IconDashboard,
      exact: true,
    },
    {
      title: "Orders",
      url: "/admin//orders",
      icon: IconShoppingCart,
      badge: 12,
      items: [
        {
          title: "All Orders",
          url: "/admin/orders",
        },
        {
          title: "Pending",
          url: "/admin/orders?status=pending",
          badge: 5,
        },
        {
          title: "Processing",
          url: "/admin/orders?status=processing",
          badge: 3,
        },
        {
          title: "Delivered",
          url: "/admin/orders?status=delivered",
        },
        {
          title: "Cancelled",
          url: "/admin/orders?status=cancelled",
          badge: 2,
        },
        {
          title: "Returns",
          url: "/admin/returns",
          badge: 2,
        },
      ],
    },
    {
      title: "Products",
      url: "/admin/products",
      icon: IconShoppingBag,
      items: [
        {
          title: "All Products",
          url: "/admin/products",
        },
        {
          title: "Add New",
          url: "/admin/products/new",
        },
        {
          title: "Categories",
          url: "/admin/categories",
          icon: IconCategory,
        },
        {
          title: "Brands",
          url: "/admin/brands",
          icon: IconBrandAppgallery,
        },
        {
          title: "Inventory",
          url: "/admin/inventory",
          icon: IconPackage,
        },
        {
          title: "Reviews",
          url: "/admin/reviews",
          icon: IconStar,
          badge: 24,
        },
      ],
    },
    {
      title: "Customers",
      url: "/admin/customers",
      icon: IconUsers,
      badge: "New",
    },
    {
      title: "Marketing",
      url: "/admin/marketing",
      icon: IconSpeakerphone,
      items: [
        {
          title: "Promotions",
          url: "/admin/marketing/promotions",
          icon: IconDiscount,
        },
        {
          title: "Coupons",
          url: "/admin/marketing/coupons",
        },
        // {
        //   title: "Email Campaigns",
        //   url: "/marketing/email",
        // },
        // {
        //   title: "Push Notifications",
        //   url: "/marketing/notifications",
        // },
      ],
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: IconChartBar,
    },
    {
      title: "Payments",
      url: "/admin/payments",
      icon: IconCashBanknote,
      items: [
        {
          title: "Transactions",
          url: "/admin/payments/transactions",
        },
        {
          title: "Withdrawals",
          url: "/admin/payments/withdrawals",
        },
        {
          title: "Payouts",
          url: "/admin/payments/payouts",
        },
      ],
    },
    {
      title: "Store Setup",
      url: "/admin/store",
      icon: IconBuildingStore,
      items: [
        {
          title: "General",
          url: "/admin/store/general",
        },
        {
          title: "Shipping",
          url: "/admin/store/shipping",
          icon: IconTruckDelivery,
        },
        {
          title: "Payment Methods",
          url: "/admin/store/payments",
          icon: IconWallet,
        },
        {
          title: "Tax Settings",
          url: "/admin/store/tax",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/admin/support",
      icon: IconMessage,
      badge: 3,
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: IconFileReport,
    },
    {
      title: "Search",
      url: "#search",
      icon: IconSearch,
    },
    {
      title: "Account Settings",
      url: "/admin/account",
      icon: IconUserCog,
    },
    {
      title: "Help Center",
      url: "/admin/help",
      icon: IconHelp,
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#" className="flex items-center gap-2">
                <div className="bg-primary text-white p-2 rounded-lg">
                  <IconShoppingBag className="!size-5" />
                </div>
                <span className="text-base font-semibold">E-Shop Admin</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
        <div className="mt-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/logout" className="text-red-500 hover:bg-red-50">
                  <IconLogout className="!size-5" />
                  <span>Logout</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}