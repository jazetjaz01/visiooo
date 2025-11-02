"use client";

import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavOpen } from "./nav-open";
import { NavAccount } from "./nav-account";
import { NavStudio } from "./nav-studio";

export function AccountSidebar() {
  const { open, setOpen } = useSidebar();
  const [initialOpen, setInitialOpen] = useState<boolean | null>(null);

  // Lire localStorage *avant* d'afficher quoi que ce soit
  useEffect(() => {
    const saved = localStorage.getItem("accountSidebarOpen");
    if (saved === null) {
      // Pas encore de valeur : on ouvre par défaut
      setInitialOpen(true);
      localStorage.setItem("accountSidebarOpen", "true");
      setOpen(true);
    } else {
      const shouldBeOpen = saved === "true";
      setInitialOpen(shouldBeOpen);
      setOpen(shouldBeOpen);
    }
  }, [setOpen]);

  // Sauvegarder les changements
  useEffect(() => {
    if (initialOpen !== null) {
      localStorage.setItem("accountSidebarOpen", open.toString());
    }
  }, [open, initialOpen]);

  // Empêcher le rendu tant que la valeur initiale n’est pas connue
  if (initialOpen === null) {
    return null; // évite le “clignotement”
  }

  return (
    <Sidebar collapsible="icon" className="min-w-[52px]" data-sidebar="account">
      <SidebarHeader>
        <div className="w-full flex items-center justify-between">
          <NavOpen />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavAccount />
        <NavStudio />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
