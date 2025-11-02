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
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function NavAccount() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const supabase = createClient();

  // ✅ Fonction de déconnexion
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

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
                <span className="group-data-[collapsible=icon]:hidden">
                  {item.name}
                </span>
              </a>
            </SidebarMenuButton>

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
                <DropdownMenuItem>Voir</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Partager</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}

        {/* 🔥 Déconnexion (texte cliquable, sans bouton) */}
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={handleLogout}
            className="flex items-center gap-2 text-destructive cursor-pointer hover:bg-destructive/10"
          >
            <LogOut />
            <span className="group-data-[collapsible=icon]:hidden">
              Déconnexion
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
