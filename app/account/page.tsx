import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";

export default async function AccountProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 🧭 Données utilisateur
  const avatar_url = user.user_metadata?.avatar_url || "/default-avatar.png";
  const full_name = user.user_metadata?.full_name || "Utilisateur";
  const username =
    user.user_metadata?.user_name ||
    user.user_metadata?.preferred_username ||
    user.email?.split("@")[0];
  const bio = user.user_metadata?.bio || "Aucune bio renseignée pour le moment.";

  // 🗓️ Date d'inscription formatée
  const createdAt = new Date(user.created_at);
  const mois = createdAt.toLocaleString("fr-FR", { month: "long" });
  const annee = createdAt.getFullYear();

  // 🎥 Nombre de vidéos publiées
  const { count: videoCount, error: videoError } = await supabase
    .from("videos")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (videoError) {
    console.error("Erreur lors du comptage des vidéos :", videoError);
  }

  return (
    <div className="flex justify-center py-8 px-4 min-h-screen">
      <div className="w-full max-w-5xl rounded-2xl overflow-hidden">
        {/* 🖼️ Bannière */}
        <div className="relative h-48 w-full bg-muted overflow-hidden rounded-2xl">
          <Image
            src="/default-banner.png"
            alt="Bannière de profil"
            fill
            className="object-cover opacity-90"
          />
        </div>

        {/* 👤 Avatar + infos utilisateur */}
        <div className="relative px-6 mt-8 flex items-center gap-4 z-10">
          {/* Avatar */}
          <div className="relative w-36 h-36 rounded-full border-4 border-background overflow-hidden shadow-md">
            <Image src={avatar_url} alt="Avatar" fill className="object-cover" />
          </div>

          {/* Nom / username / date */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-semibold">{full_name}</h1>
            <p className="text-base text-muted-foreground">@{username}</p>
            <p className="text-base text-muted-foreground">
              Membre depuis {mois.charAt(0).toUpperCase() + mois.slice(1)} {annee}
            </p>
          </div>
        </div>

        {/* 📈 Statistiques */}
        <div className="flex gap-6 mt-6 px-6">
          <div>
            <p className="text-lg font-semibold text-center">12</p>
            <p className="text-sm text-muted-foreground">Abonnés</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-center">{videoCount ?? 0}</p>
            <p className="text-sm text-muted-foreground">Vidéos</p>
          </div>
        </div>

        {/* 📝 Bio */}
        <div className="px-6 mt-8 mb-12">
          <h2 className="text-lg font-semibold mb-2">Bio</h2>
          <p className="text-muted-foreground leading-relaxed">{bio}</p>
        </div>
      </div>
    </div>
  );
}
