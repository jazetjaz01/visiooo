"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";

export function AccountBreadcrumb() {
  const pathname = usePathname();

  // 🧠 Détermine la dernière partie de l'URL
  const path = pathname.split("/").filter(Boolean);
  const last = path[path.length - 1];

  const getLabel = (segment: string) => {
    switch (segment) {
      case "profile":
        return "Mon profil";
      case "settings":
        return "Paramètres";
      case "edit":
        return "Modifier le profil";
      default:
        return "Compte";
    }
  };

  const currentLabel = getLabel(last);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden sm:inline-flex">
          <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden sm:inline-flex" />

        <BreadcrumbItem className="hidden sm:inline-flex">
          <BreadcrumbLink href="/account">Compte</BreadcrumbLink>
        </BreadcrumbItem>

        {/* 🧩 Sur mobile : afficher seulement "..." */}
        <BreadcrumbItem className="sm:hidden">
          <BreadcrumbEllipsis />
        </BreadcrumbItem>

        {/* ✅ Un seul séparateur avant la page actuelle */}
        <BreadcrumbSeparator />

        <BreadcrumbItem>
          <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
