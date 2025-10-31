import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();

  // Récupère les claims de l'utilisateur
  const { data, error } = await supabase.auth.getClaims();

  // Si pas connecté, redirige vers la page de login
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  // Ici, l'utilisateur est authentifié
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">
        Bienvenue sur votre page account
      </h1>
      <p className="mt-2 text-muted-foreground">
        Vous êtes connecté en tant que :{" "}
        <span className="font-medium">{data.claims.email}</span>
      </p>
    </div>
  );
}
