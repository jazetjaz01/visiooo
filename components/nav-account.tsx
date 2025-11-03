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
import { useRouter, usePathname } from "next/navigation";
import clsx from "clsx";

export function NavAccount() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  // 🔐 Déconnexion
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const accountLinks = [
    { name: "Profil", url: "/account/profile", icon: User },
    { name: "Paramètres", url: "/account/settings", icon: Settings },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
        Mon compte
      </SidebarGroupLabel>

      <SidebarMenu>
        {accountLinks.map((item) => {
          const isActive = pathname.startsWith(item.url);

          return (
            <SidebarMenuItem key={item.name}>
              {/* Bouton principal */}
              <SidebarMenuButton asChild>
                <a
                  href={item.url}
                  className={clsx(
                    "flex items-center gap-2",
                    isActive && "font-semibold"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    {item.name}
                  </span>
                </a>
              </SidebarMenuButton>

              {/* Menu contextuel */}
              {item.name === "Profil" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction showOnHover>
                      <MoreHorizontal className="w-4 h-4" />
                      <span className="sr-only">Options du profil</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    className="w-48 rounded-lg"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >
                    <DropdownMenuItem
                      onClick={() => router.push("/account/profile")}
                    >
                      Voir le profil
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => router.push("/account/profile/edit")}
                    >
                      Modifier le profil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarMenuItem>
          );
        })}

        {/* 🔴 Déconnexion */}
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={handleLogout}
            className="flex items-center gap-2 cursor-pointer hover:bg-destructive/10"
          >
            <LogOut className="w-5 h-5" />
            <span className="group-data-[collapsible=icon]:hidden">
              Déconnexion
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
