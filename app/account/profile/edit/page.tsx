"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function EditProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [profile, setProfile] = useState({
    full_name: "",
    username: "",
    bio: "",
    avatar_url: "",
    banner_url: "",
    location: "",
    birthday: "",
  });

  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [previewBanner, setPreviewBanner] = useState<string | null>(null);

  // 🔹 Limites de mots
  const wordLimits = {
    full_name: 5,
    username: 3,
    bio: 40,
  };

  const limitWords = (value: string, limit: number) => {
    const words = value.split(/\s+/).filter(Boolean);
    if (words.length > limit) {
      return words.slice(0, limit).join(" ");
    }
    return value;
  };

  // 🔹 Charger les données utilisateur
  useEffect(() => {
    async function loadProfile() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return router.push("/auth/login");

      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (error && error.code !== "PGRST116") console.error("Erreur chargement profil :", error);

      if (data) {
        setProfile((prev) => ({ ...prev, ...data }));
        setPreviewAvatar(data.avatar_url || null);
        setPreviewBanner(data.banner_url || null);
      }
      setLoading(false);
    }
    loadProfile();
  }, [router, supabase]);

  // 🔹 Gestion des changements avec limite de mots
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const limit = wordLimits[name as keyof typeof wordLimits];
    const limitedValue = limit ? limitWords(value, limit) : value;
    setProfile((prev) => ({ ...prev, [name]: limitedValue }));
  };

  const getPathFromPublicUrl = (publicUrl: string, bucket: string) => {
    try {
      const url = new URL(publicUrl);
      const prefix = `/storage/v1/object/public/${bucket}/`;
      const index = url.pathname.indexOf(prefix);
      if (index === -1) return null;
      return url.pathname.slice(index + prefix.length);
    } catch {
      return null;
    }
  };

  // 🔹 Upload images
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "banner") => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const previewUrl = URL.createObjectURL(file);
    if (type === "avatar") setPreviewAvatar(previewUrl);
    else setPreviewBanner(previewUrl);

    setUploading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/auth/login");

    const folder = type === "avatar" ? "avatars" : "banners";
    const filePath = `${folder}/${user.id}-${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from(folder).upload(filePath, file, { upsert: true });
    if (uploadError) {
      alert("Erreur upload : " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData, error: urlError } = supabase.storage.from(folder).getPublicUrl(filePath);
    if (urlError) {
      alert("Erreur récupération URL : " + urlError.message);
      setUploading(false);
      return;
    }
    const publicUrl = urlData.publicUrl;

    const oldFileUrl = profile[type === "avatar" ? "avatar_url" : "banner_url"];
    if (oldFileUrl) {
      const oldFilePath = getPathFromPublicUrl(oldFileUrl, folder);
      if (oldFilePath) await supabase.storage.from(folder).remove([oldFilePath]);
    }

    await supabase.from("profiles").upsert({
      id: user.id,
      [type === "avatar" ? "avatar_url" : "banner_url"]: publicUrl,
      updated_at: new Date().toISOString(),
    });

    setProfile((prev) => ({
      ...prev,
      [type === "avatar" ? "avatar_url" : "banner_url"]: publicUrl,
    }));
    setUploading(false);
  };

  // 🧠 Vérifie la présence de mots interdits dans un texte
  const containsBannedWords = async (text: string): Promise<string[]> => {
    const { data: bannedWords, error } = await supabase.from("banned_words").select("word");
    if (error) {
      console.error("Erreur lors de la récupération des mots interdits :", error);
      return [];
    }

    const lowerText = text.toLowerCase();
    const found = bannedWords
      .map((bw) => bw.word.toLowerCase())
      .filter((word) => lowerText.includes(word));

    return found;
  };

  // 🔹 Soumission du formulaire avec modération
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // 🧩 Vérification des mots interdits
    const fieldsToCheck = [
      { name: "Nom complet", value: profile.full_name },
      { name: "Nom d’utilisateur", value: profile.username },
      { name: "Bio", value: profile.bio },
    ];

    for (const field of fieldsToCheck) {
      const badWords = await containsBannedWords(field.value);
      if (badWords.length > 0) {
        alert(`❌ ${field.name} contient des mots innapropriés : ${badWords.join(", ")}`);
        setSaving(false);
        return;
      }
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/auth/login");

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: profile.full_name,
      username: profile.username,
      bio: profile.bio,
      location: profile.location,
      birthday: profile.birthday || null,
      updated_at: new Date().toISOString(),
    });

    setSaving(false);

    if (error) {
      alert("Erreur lors de la mise à jour : " + error.message);
    } else {
      router.push("/account/profile");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        Chargement...
      </div>
    );

  const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold mb-6">Modifier mon profil</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bannière */}
        <div className="relative h-40 w-full bg-muted rounded-2xl overflow-hidden">
          {previewBanner ? (
            <Image src={previewBanner} alt="Bannière" fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Aucune bannière
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Upload de la bannière</label>
          <Input type="file" accept="image/*" onChange={(e) => handleUpload(e, "banner")} />
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden">
            <Image src={previewAvatar || "/default-avatar.png"} alt="Avatar" fill className="object-cover" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Upload de l’avatar</label>
            <Input type="file" accept="image/*" onChange={(e) => handleUpload(e, "avatar")} />
          </div>
        </div>

        {/* Nom complet */}
        <div>
          <label className="block text-sm font-medium mb-1">Nom complet</label>
          <Input name="full_name" value={profile.full_name || ""} onChange={handleChange} placeholder="Nom complet" />
          <p className="text-xs text-muted-foreground mt-1">
            {wordCount(profile.full_name)}/{wordLimits.full_name} mots max
          </p>
        </div>

        {/* Nom d’utilisateur */}
        <div>
          <label className="block text-sm font-medium mb-1">Nom d’utilisateur</label>
          <Input name="username" value={profile.username || ""} onChange={handleChange} placeholder="Nom d’utilisateur" />
          <p className="text-xs text-muted-foreground mt-1">
            {wordCount(profile.username)}/{wordLimits.username} mots max
          </p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <Textarea name="bio" value={profile.bio || ""} onChange={handleChange} placeholder="Bio" rows={4} />
          <p className="text-xs text-muted-foreground mt-1">
            {wordCount(profile.bio)}/{wordLimits.bio} mots max
          </p>
        </div>

        {/* Localisation */}
        <div>
          <label className="block text-sm font-medium mb-1">Localisation</label>
          <Input name="location" value={profile.location || ""} onChange={handleChange} placeholder="Localisation" />
        </div>

        {/* Date de naissance */}
        <div>
          <label className="block text-sm font-medium mb-1">Date de naissance</label>
          <Input type="date" name="birthday" value={profile.birthday || ""} onChange={handleChange} />
        </div>

        {/* Boutons */}
        <div className="flex justify-end gap-4 pt-6">
          <Button type="button" variant="outline" onClick={() => router.push("/account/profile")}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving || uploading}>
            {saving ? "Enregistrement..." : uploading ? "Upload en cours..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
