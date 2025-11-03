"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Profile {
  full_name: string;
  username: string;
  bio: string;
  avatar_url: string;
  banner_url: string;
  location: string;
  birthday: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [profile, setProfile] = useState<Profile>({
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

  // Limites de mots
  const wordLimits = {
    full_name: 5,
    username: 3,
    bio: 40,
  };

  // Limite de mots
  const limitWords = (value: string, limit: number) => {
    const words = value.split(/\s+/).filter(Boolean);
    return words.length > limit ? words.slice(0, limit).join(" ") : value;
  };

  // Vérification des gros mots via la table bad_words
  const containsBadWords = async (text: string) => {
    const { data: badWords } = await supabase.from("bad_words").select("word");
    if (!badWords) return false;
    const lowerText = text.toLowerCase();
    return badWords.some((bw) => lowerText.includes(bw.word.toLowerCase()));
  };

  // Charger les données utilisateur
  useEffect(() => {
    async function loadProfile() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return router.push("/auth/login");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

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

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Limite de mots
    const limit = wordLimits[name as keyof typeof wordLimits] || Infinity;
    let limitedValue = limitWords(value, limit);

    // Modération
    const hasBadWords = await containsBadWords(limitedValue);
    if (hasBadWords) {
      alert(`Le champ "${name}" contient des mots interdits.`);
      return;
    }

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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "banner") => {
  if (!e.target.files || e.target.files.length === 0) return;
  const file = e.target.files[0];

  const previewUrl = URL.createObjectURL(file);
  if (type === "avatar") setPreviewAvatar(previewUrl);
  else setPreviewBanner(previewUrl);

  setUploading(true);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    setUploading(false);
    return router.push("/auth/login");
  }

  const folder = type === "avatar" ? "avatars" : "banners";
  const filePath = `${folder}/${user.id}-${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(folder)
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    alert("Erreur upload : " + uploadError.message);
    setUploading(false);
    return;
  }

  // ✅ Correction ici : plus de "error" renvoyé
  const { data: urlData } = supabase.storage.from(folder).getPublicUrl(filePath);
  const publicUrl = urlData.publicUrl;

  const oldFileUrl = profile[type === "avatar" ? "avatar_url" : "banner_url"];
  if (oldFileUrl) {
    const oldFilePath = getPathFromPublicUrl(oldFileUrl, folder);
    if (oldFilePath) {
      await supabase.storage.from(folder).remove([oldFilePath]);
    }
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/auth/login");

    // Modération finale avant sauvegarde
    for (const key of ["full_name", "username", "bio"]) {
      const text = profile[key as keyof Profile] || "";
      if (await containsBadWords(text)) {
        alert(`Le champ "${key}" contient des mots interdits.`);
        setSaving(false);
        return;
      }
    }

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

  if (loading) return <div className="flex justify-center items-center min-h-screen">Chargement...</div>;

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
            <div className="flex items-center justify-center h-full text-muted-foreground">Aucune bannière</div>
          )}
        </div>
        <Input type="file" accept="image/*" onChange={(e) => handleUpload(e, "banner")} />

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden">
            <Image src={previewAvatar || "/default-avatar.png"} alt="Avatar" fill className="object-cover" />
          </div>
          <Input type="file" accept="image/*" onChange={(e) => handleUpload(e, "avatar")} />
        </div>

        {/* Nom complet */}
        <div>
          <Input name="full_name" value={profile.full_name} onChange={handleChange} placeholder="Nom complet" />
          <p className="text-xs text-muted-foreground mt-1">
            {wordCount(profile.full_name)}/{wordLimits.full_name} mots max
          </p>
        </div>

        {/* Nom utilisateur */}
        <div>
          <Input name="username" value={profile.username} onChange={handleChange} placeholder="Nom d’utilisateur" />
          <p className="text-xs text-muted-foreground mt-1">
            {wordCount(profile.username)}/{wordLimits.username} mots max
          </p>
        </div>

        {/* Bio */}
        <div>
          <Textarea name="bio" value={profile.bio} onChange={handleChange} placeholder="Bio" rows={4} />
          <p className="text-xs text-muted-foreground mt-1">
            {wordCount(profile.bio)}/{wordLimits.bio} mots max
          </p>
        </div>

        {/* Localisation */}
        <Input name="location" value={profile.location} onChange={handleChange} placeholder="Localisation" />

        {/* Date de naissance */}
        <Input type="date" name="birthday" value={profile.birthday} onChange={handleChange} />

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
