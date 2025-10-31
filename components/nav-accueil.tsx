"use client";

import { Home, PlaySquare, Users, ListVideo } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavAccueil() {
  const navItems = [
    { name: "Accueil", url: "/", icon: Home },
    { name: "Shorts", url: "/shorts", icon: PlaySquare },
    { name: "Abonnements", url: "/abonnements", icon: ListVideo },
    { name: "Mon compte", url: "/account", icon: Users, color: "text-teal-700" },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild>
                <a href={item.url} className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${item.color ? item.color : ""}`} />
                  <span>{item.name}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
