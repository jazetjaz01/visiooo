"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

interface Channel {
  id: string;
  name: string;
  handle: string;
}

export default function UploadPage() {
  const supabase = createClient();
  const router = useRouter();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [visibility, setVisibility] = useState<"public" | "unlisted" | "private">("public");
  const [isMadeForKids, setIsMadeForKids] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const categories = [
    "Légendaires",
    "Voyages",
    "Musiques",
    "Cinéma",
    "Séries TV",
    "Direct",
    "Jeux vidéos",
    "Actualités",
    "Sports",
    "Humours",
    "Podcasts",
    "Voitures",
  ];
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [thumbProgress, setThumbProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const thumbInputRef = useRef<HTMLInputElement | null>(null);

  // --- Récupération des chaînes ---
  useEffect(() => {
    async function fetchChannels() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("channels")
        .select("id, name, handle")
        .eq("user_id", user.id);

      if (error) console.error("Erreur chargement chaînes :", error);
      else {
        setChannels(data || []);
        if (data && data.length === 1) setSelectedChannel(data[0].id);
      }
    }

    fetchChannels();
  }, [supabase]);

  // --- Helpers ---
  const parseTags = (raw: string) =>
    Array.from(
      new Set(
        raw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      )
    );

  const getPublicUrl = (path: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/videos/${encodeURIComponent(
      path
    )}`;

  async function uploadFileWithProgress(
    file: File,
    filePath: string,
    token: string,
    setProgress: (p: number) => void
  ) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const url = `${supabaseUrl}/storage/v1/object/videos/${encodeURIComponent(filePath)}`;

    return new Promise<{ status: number }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url, true);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.setRequestHeader("x-upsert", "false");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve({ status: xhr.status });
        else reject(new Error(`Upload failed (${xhr.status})`));
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(file);
    });
  }

  // --- Envoi du formulaire ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!videoFile) return setErrorMsg("Veuillez sélectionner un fichier vidéo.");
    if (!title.trim()) return setErrorMsg("Le titre est obligatoire.");
    if (!selectedChannel)
      return setErrorMsg("Veuillez choisir une chaîne pour publier votre vidéo.");

    try {
      setLoading(true);
      setUploadProgress(0);
      setThumbProgress(0);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Utilisateur non connecté.");

      const token = session.access_token;
      const userId = session.user.id;

      // Upload vidéo
      const ext = videoFile.name.split(".").pop() || "mp4";
      const videoPath = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      await uploadFileWithProgress(videoFile, videoPath, token, setUploadProgress);

      // Upload miniature
      let thumbnailUrl: string | null = null;
      if (thumbnailFile) {
        const thumbExt = thumbnailFile.name.split(".").pop() || "jpg";
        const thumbPath = `${userId}/thumbs/${Date.now()}_${Math.random().toString(36).slice(2)}.${thumbExt}`;
        await uploadFileWithProgress(thumbnailFile, thumbPath, token, setThumbProgress);
        thumbnailUrl = getPublicUrl(thumbPath);
      }

      const videoUrl = getPublicUrl(videoPath);

      const { error } = await supabase.from("videos").insert({
        user_id: userId,
        channel_id: selectedChannel,
        title: title.trim(),
        description: description || null,
        category: selectedCategories,
        tags: parseTags(tagsRaw),
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        visibility,
        is_made_for_kids: isMadeForKids,
        is_premium: isPremium,
      });

      if (error) throw error;

      setSuccessMsg("✅ Vidéo uploadée avec succès !");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de l'upload");
    } finally {
      setLoading(false);
    }
  };

  // --- Si aucune chaîne ---
  if (channels.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <Card className="max-w-lg text-center p-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Aucune chaîne trouvée</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Vous devez créer une chaîne avant de pouvoir uploader une vidéo.
            </p>
            <Link href="/account/create-channel">
              <Button className="mt-2">Créer ma première chaîne</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Formulaire complet si chaînes disponibles ---
  return (
    <div className="flex justify-center px-4 py-12">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Uploader une nouvelle vidéo</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            {/* --- Choix de la chaîne --- */}
            <div>
              <Label>Choisir la chaîne</Label>
              <div className="flex flex-col gap-2 mt-1">
                {channels.map((ch) => (
                  <div key={ch.id} className="flex items-center gap-2">
                    <Switch
                      checked={selectedChannel === ch.id}
                      onCheckedChange={() => setSelectedChannel(ch.id)}
                    />
                    <span className="text-sm">{ch.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* --- Infos principales --- */}
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de la vidéo"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optionnelle)"
              />
            </div>

            {/* --- Fichiers --- */}
            <div>
              <Label>Vidéo</Label>
              <Input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                required
              />
              {uploadProgress > 0 && (
                <div className="mt-2">
                  <Progress value={uploadProgress} />
                  <div className="text-xs text-muted-foreground mt-1">{uploadProgress}%</div>
                </div>
              )}
            </div>

            <div>
              <Label>Miniature (optionnelle)</Label>
              <Input
                ref={thumbInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
              />
              {thumbProgress > 0 && (
                <div className="mt-2">
                  <Progress value={thumbProgress} />
                  <div className="text-xs text-muted-foreground mt-1">{thumbProgress}%</div>
                </div>
              )}
            </div>

            {/* --- Options --- */}
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="kids"
                  checked={isMadeForKids}
                  onCheckedChange={(v) => setIsMadeForKids(!!v)}
                />
                <Label htmlFor="kids">Fait pour les enfants</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="premium"
                  checked={isPremium}
                  onCheckedChange={(v) => setIsPremium(!!v)}
                />
                <Label htmlFor="premium">Premium</Label>
              </div>
            </div>

            {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
            {successMsg && <p className="text-green-600 text-sm">{successMsg}</p>}

            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Envoi en cours..." : "Uploader la vidéo"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
