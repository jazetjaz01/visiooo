"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Menu, X } from "lucide-react";

export function NavOpen() {
  const { open, setOpen } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setOpen(!open)}
      className="rounded-xl"
      aria-label={open ? "Fermer la barre latérale" : "Ouvrir la barre latérale"}
    >
      {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </Button>
  );
}
