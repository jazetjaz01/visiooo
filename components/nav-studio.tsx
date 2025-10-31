"use client";

import {
  LayoutDashboard,
  FileText,
  BarChart2,
  Users,
  DollarSign,
  Settings,
  Music,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavStudio() {
  const items = [
    { name: "Tableau de bord", url: "/studio/dashboard", icon: LayoutDashboard },
    { name: "Contenus", url: "/studio/contenus", icon: FileText },
    { name: "Données analytiques", url: "/studio/analytiques", icon: BarChart2 },
    { name: "Communautés", url: "/studio/communautes", icon: Users },
    { name: "Revenus", url: "/studio/revenus", icon: DollarSign },
    { name: "Personnalisation", url: "/studio/personalisation", icon: Settings },
    { name: "Bibliothèque audio", url: "/studio/bibliotheque-audio", icon: Music },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Studio</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url} className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
