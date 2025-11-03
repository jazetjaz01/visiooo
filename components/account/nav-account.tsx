"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavAccount() {
  const pathname = usePathname();

  const links = [
    { href: "/account/profile", label: "Profil", icon: User },
    { href: "/account/settings", label: "Paramètres", icon: Settings },
  ];

  return (
    <nav className="flex flex-col gap-1 mt-4">
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
