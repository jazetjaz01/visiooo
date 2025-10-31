"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "./logout-button";

export function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    // Vérifie l'état initial
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user);
    });

    // Écoute les changements d'auth
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Nettoyage
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  if (user) {
    const avatarUrl =
      user.user_metadata?.avatar_url || "/default-avatar.png";
    const displayName =
      user.user_metadata?.full_name || user.email;

    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {/* 🔹 Affiche la photo Google */}
          <img
            src={avatarUrl}
            alt="User avatar"
            className="w-8 h-8 rounded-full object-cover border border-gray-300 hidden md:block"
          />
          <span className="font-medium hidden md:block">
            {displayName}!
          </span>
        </div>
        <LogoutButton />
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        asChild
        variant="outline"
        className=" rounded-full"
      >
        <Link href="/auth/login">Se connecter</Link>
      </Button>
      <Button asChild className="rounded-ful hidden sm:inline-flex">
        <Link href="/auth/sign-up">S'enregistrer</Link>
      </Button>
    </div>
  );
}
