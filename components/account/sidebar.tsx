"use client";

import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavOpen } from "../nav-open";
import { NavAccount } from "../nav-account";
import { NavStudio } from "../nav-studio";

export function AccountSidebar() {
  const { open, setOpen } = useSidebar();
  const [initialOpen, setInitialOpen] = useState<boolean | null>(null);

  // 🔹 Lecture initiale de localStorage au montage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("accountSidebarOpen");
      if (saved === null) {
        // Première visite → on ouvre par défaut
        setInitialOpen(true);
        setOpen(true);
        localStorage.setItem("accountSidebarOpen", "true");
      } else {
        const shouldBeOpen = saved === "true";
        setInitialOpen(shouldBeOpen);
        setOpen(shouldBeOpen);
      }
    } catch (error) {
      console.error("Erreur lors de la lecture de localStorage :", error);
      setInitialOpen(true);
      setOpen(true);
    }
  }, []); // ✅ exécution unique

  // 🔹 Sauvegarder les changements locaux dans localStorage
  useEffect(() => {
    if (initialOpen !== null) {
      localStorage.setItem("accountSidebarOpen", open.toString());
    }
  }, [open, initialOpen]);

  // 🔹 Synchroniser entre onglets (écoute des changements de localStorage)
  useEffect(() => {
    function handleStorageChange(event: StorageEvent) {
      if (event.key === "accountSidebarOpen" && event.newValue !== null) {
        const newState = event.newValue === "true";
        setOpen(newState);
      }
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [setOpen]);

  // 🔹 Empêcher le rendu tant que la valeur initiale n’est pas connue
  if (initialOpen === null) {
    return null; // évite le clignotement
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
