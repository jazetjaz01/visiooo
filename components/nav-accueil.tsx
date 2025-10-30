"use client"

import { Home, PlaySquare, Users } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavAccueil() {
  const navItems = [
    { name: "Accueil", url: "/", icon: Home },
    { name: "Shorts", url: "/shorts", icon: PlaySquare },
    { name: "Abonnements", url: "/abonnements", icon: Users },
  ]

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url} className="flex  gap-2 ">
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
