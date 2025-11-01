"use client";

import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Wrapper Menubar
function Menubar({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return <MenubarPrimitive.Root className={cn("flex items-center gap-2", className)} {...props} />;
}

// Trigger + icône
function MenubarTrigger({ className, children, ...props }: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      className={cn(
        "flex items-center gap-1 px-0 py-0 text-sm font-medium rounded-none hover:bg-transparent focus:bg-transparent focus:ring-0",
        className
      )}
      {...props}
    >
      <PlusIcon className="w-4 h-4" />
      {children}
    </MenubarPrimitive.Trigger>
  );
}

// Menu déroulant
function MenubarContent({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        className={cn(
          "bg-popover text-popover-foreground z-50 min-w-[8rem] rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  );
}

function MenubarItem({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Item>) {
  return (
    <MenubarPrimitive.Item
      className={cn(
        "flex cursor-pointer items-center px-2 py-1 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    />
  );
}

// Component complet avec authentification
export function CreateMenu() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();

    // Écoute les changements d'auth
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Ne rien afficher si l'utilisateur n'est pas connecté
  if (!user) return null;

  return (
    <Menubar>
      <MenubarPrimitive.Menu>
        <MenubarTrigger>Créer</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onSelect={() => router.push("/account/upload")}>Vidéo</MenubarItem>
          <MenubarItem onSelect={() => router.push("/account/channel/create")}>Chaîne</MenubarItem>
        </MenubarContent>
      </MenubarPrimitive.Menu>
    </Menubar>
  );
}
