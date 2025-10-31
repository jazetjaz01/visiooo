"use client";

import { LogOut, Settings, User, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavAccount() {
  const { isMobile } = useSidebar();

  const accountLinks = [
    { name: "Profil", url: "/account", icon: User },
    { name: "Paramètres", url: "/account/settings", icon: Settings },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
        Mon compte
      </SidebarGroupLabel>
      <SidebarMenu>
        {accountLinks.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a className="flex items-center gap-2" href={item.url}>
                <item.icon />
                <span className="group-data-[collapsible=icon]:hidden">{item.name}</span>
              </a>
            </SidebarMenuButton>

            {/* Dropdown optionnel */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">Options</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <span>Voir</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span>Partager</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}

        {/* Déconnexion */}
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <a
              className="flex items-center gap-2 text-destructive"
              href="/logout"
            >
              <LogOut />
              <span className="group-data-[collapsible=icon]:hidden">Déconnexion</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
