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

  const avatar_url = user.user_metadata?.avatar_url || "/default-avatar.png";
  const full_name = user.user_metadata?.full_name || "Utilisateur";
  const username =
    user.user_metadata?.user_name ||
    user.user_metadata?.preferred_username ||
    user.email?.split("@")[0];
  const email = user.email;
  const is_verified = user.user_metadata?.email_verified ?? false;

  return (
    <div className="flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-3xl">
        {/* 🖼️ Bannière */}
        <div className="relative h-48 w-full bg-muted rounded-xl overflow-hidden">
          <Image
            src="/default-banner.png"
            alt="Bannière de profil"
            fill
            className="object-cover opacity-80"
          />
        </div>

        {/* 👤 Avatar + infos principales */}
        <div className="flex items-end gap-4 mt-6 ">
          <div className="relative w-24 h-24 rounded-full border-4 border-background overflow-hidden">
            <Image src={avatar_url} alt="Avatar" fill className="object-cover" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              {full_name}
              {is_verified && (
                <span className="text-green-500 text-sm">✔ Vérifié</span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground">@{username}</p>
            <p className="text-sm text-muted-foreground mt-1">{email}</p>
          </div>
        </div>

        {/* 📈 Statistiques */}
        <div className="flex gap-6 px-6 mt-6">
          <div>
            <p className="text-lg font-semibold">12</p>
            <p className="text-sm text-muted-foreground">Abonnés</p>
          </div>
          <div>
            <p className="text-lg font-semibold">4</p>
            <p className="text-sm text-muted-foreground">Vidéos</p>
          </div>
        </div>

        {/* 📝 Bio */}
        <div className="px-6 mt-8">
          <h2 className="text-lg font-semibold mb-2">Bio</h2>
          <p className="text-muted-foreground">
            {user.user_metadata?.bio || "Aucune bio renseignée pour le moment."}
          </p>
        </div>

        {/* ⚙️ Informations */}
        <div className="px-6 mt-8 mb-12">
          <h2 className="text-lg font-semibold mb-2">Informations du compte</h2>
          <pre className="bg-muted text-xs p-3 rounded-md overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
