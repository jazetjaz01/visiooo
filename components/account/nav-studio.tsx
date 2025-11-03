"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Video, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavStudio() {
  const pathname = usePathname();

  const links = [
    { href: "/account/videos", label: "Mes vidéos", icon: Video },
    { href: "/account/analytics", label: "Statistiques", icon: BarChart },
  ];

  return (
    <nav className="flex flex-col gap-1 mt-6 border-t pt-4">
      {links.map(({ href, label, icon: Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
