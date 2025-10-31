"use client";

import { Sidebar, SidebarHeader, SidebarContent, SidebarRail } from "@/components/ui/sidebar";
import { NavOpen } from "./nav-open";
import { NavAccount } from "./nav-account";
import { NavStudio } from "./nav-studio";

export function AccountSidebar() {
  return (
    <Sidebar collapsible="icon" className="min-w-[52px]">
      <SidebarHeader>
        <div className="w-full flex items-center justify-between">
          <NavOpen />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavAccount />
        <NavStudio />
      </SidebarContent>

      {/* SidebarRail pour garder les icônes visibles */}
      <SidebarRail />
    </Sidebar>
  );
}
