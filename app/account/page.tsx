import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";


import { ReportProfileButton } from "@/components/ReportProfileButton";
export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("id, avatar_url, banner_url, full_name, username, bio")
    .eq("id", user.id)
    .single();

  if (profileError) console.error("Erreur récupération profil :", profileError);

  const avatar_url = profileData?.avatar_url || "/default-avatar.png";
  const banner_url = profileData?.banner_url || "/default-banner.png";
  const full_name = profileData?.full_name || user.user_metadata?.full_name || "Utilisateur";
  const username = profileData?.username || user.user_metadata?.user_name || user.user_metadata?.preferred_username || user.email?.split("@")[0];
  const bio = profileData?.bio || user.user_metadata?.bio || "Aucune bio renseignée pour le moment.";

  const createdAt = new Date(user.created_at);
  const mois = createdAt.toLocaleString("fr-FR", { month: "long" });
  const annee = createdAt.getFullYear();

  return (
    <div className="flex justify-center py-8 px-4 min-h-screen">
      <div className="w-full max-w-5xl rounded-2xl overflow-hidden">
        {/* Bannière et avatar */}
        <div className="relative h-48 w-full bg-muted overflow-hidden rounded-2xl">
          <Image src={banner_url} alt="Bannière de profil" fill className="object-cover opacity-90" />
        </div>
        <div className="relative px-6 mt-8 flex items-center gap-4 z-10">
          <div className="relative w-36 h-36 rounded-full border-4 border-background overflow-hidden shadow-md">
            <Image src={avatar_url} alt="Avatar" fill className="object-cover" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold">{full_name}</h1>
              {user.id === profileData?.id && (
                <Link href="/account/profile/edit" className="text-teal-600 text-base ml-4 font-semibold hover:underline">
                  Modifier mon profil
                </Link>
              )}
            </div>
            <p className="text-base text-muted-foreground">@{username}</p>
            <p className="text-base text-muted-foreground">
              Membre depuis {mois.charAt(0).toUpperCase() + mois.slice(1)} {annee}
            </p>
          </div>
        </div>

        {/* Bio */}
        <div className="px-6 mt-8 mb-8">
          <h2 className="text-lg font-semibold mb-2">Bio</h2>
          <p className="text-muted-foreground leading-relaxed">{bio}</p>
        </div>

        {/* Bouton signaler si ce n’est pas son propre profil */}
        {user.id !== profileData?.id && (
          <div className="px-6 mb-12">
            <ReportProfileButton profileId={profileData!.id} />
          </div>
        )}
      </div>
    </div>
  );
}
