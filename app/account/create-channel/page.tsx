"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateChannelPage() {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file: File, folder: string) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("channels")
      .upload(`${folder}/${fileName}`, file);

    if (error) {
      console.error("Erreur upload :", error);
      return null;
    }

    const { data: publicUrl } = supabase.storage
      .from("channels")
      .getPublicUrl(`${folder}/${fileName}`);

    return publicUrl?.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Veuillez vous connecter pour créer une chaîne.");
      setLoading(false);
      return;
    }

    let avatarUrl = null;
    let bannerUrl = null;

    if (avatar) avatarUrl = await handleUpload(avatar, `${user.id}/avatar`);
    if (banner) bannerUrl = await handleUpload(banner, `${user.id}/banner`);

    const cleanHandle = handle.replace("@", "").trim();

    const { data, error } = await supabase
      .from("channels")
      .insert({
        user_id: user.id,
        name,
        handle: cleanHandle,
        description,
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error("Erreur lors de la création :", error);
      alert("Une erreur est survenue.");
    } else {
      router.push(`/channel/${data.handle}`);
    }
  };

  return (
    <div className="min-h-screen dark:bg-black flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg shadow-lg border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Créer votre chaîne
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom de la chaîne</label>
              <Input
                placeholder="Ex: tk78 remix"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Identifiant (@handle)</label>
              <Input
                placeholder="@tk78remix"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                placeholder="Décrivez votre chaîne..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Avatar</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatar(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bannière</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setBanner(e.target.files?.[0] || null)}
              />
            </div>

            <Button type="submit" disabled={loading} className="mt-4">
              {loading ? "Création en cours..." : "Créer la chaîne"}
            </Button>
          </form>
        </CardContent>
      </div>
    </div>
  );
}
