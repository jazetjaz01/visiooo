// app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        // 🔹 Rafraîchit la session et la Navbar
        router.refresh();
        router.replace("/"); // renvoie à la home
      } else {
        router.replace("/auth/login");
      }
    });
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg font-semibold">Connexion en cours...</p>
    </div>
  );
}
