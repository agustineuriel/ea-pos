"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
// import { signOut } from "next-auth/react";

import Image from "next/image";

// Menu items.
const items = [
  {
    title: "📊 Dashboard",
    url: "/",
  },
   {
    title: "📦 Inventory",
    url: "/inventory",
  },
   {
    title: "🛒 Create Order",
    url: "/order",
  },
   {
    title: "📑 Order History",
    url: "/order-history",
  },
   {
    title: "💵 Create Invoice",
    url: "/invoice",
  },
   {
    title: "🧾 Invoice History",
    url: "/invoice-history",
  },
     {
    title: "⚙️ System Logs",
    url: "/system-logs",
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <div className="flex justify-center items-center mt-4">
      <Image src="/logo.png" height={200} width={200} alt="Logo" className="flex justify-center items-center" />
      </div>
      <h1 className="flex justify-center text-center text-3xl font-bold text-[#212121]">EA Street Motoshop POS</h1>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarMenu>
            <SidebarMenuItem key="logout">
              <SidebarMenuButton asChild>
              <button 
            //   onClick={() => signOut()}
              >
              <span>🚪 Logout</span>
            </button>

              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
    
  );
}