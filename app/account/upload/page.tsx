"use client";

import React, { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// Custom components
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

export default function UploadPage() {
  const supabase = createClient();
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [visibility, setVisibility] = useState<"public" | "unlisted" | "private">("public");
  const [isMadeForKids, setIsMadeForKids] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // Categories
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
    "Voitures"
  ];

  // State pour plusieurs catégories
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // File state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [thumbProgress, setThumbProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const thumbInputRef = useRef<HTMLInputElement | null>(null);

  // Helper: parse tags
  const parseTags = (raw: string) =>
    Array.from(
      new Set(
        raw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      )
    );

  // Upload helper with progress
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

  const getPublicUrl = (path: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/videos/${encodeURIComponent(
      path
    )}`;

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!videoFile) return setErrorMsg("Veuillez sélectionner un fichier vidéo.");
    if (!title.trim()) return setErrorMsg("Le titre est obligatoire.");

    try {
      setLoading(true);
      setUploadProgress(0);
      setThumbProgress(0);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error("Utilisateur non connecté.");

      const token = session.access_token;
      const userId = session.user.id;

      // Upload video
      const ext = videoFile.name.split(".").pop() || "mp4";
      const videoPath = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      await uploadFileWithProgress(videoFile, videoPath, token, setUploadProgress);

      // Upload thumbnail (optional)
      let thumbnailUrl: string | null = null;
      if (thumbnailFile) {
        const thumbExt = thumbnailFile.name.split(".").pop() || "jpg";
        const thumbPath = `${userId}/thumbs/${Date.now()}_${Math.random()
          .toString(36)
          .slice(2)}.${thumbExt}`;
        await uploadFileWithProgress(thumbnailFile, thumbPath, token, setThumbProgress);
        thumbnailUrl = getPublicUrl(thumbPath);
      }

      const videoUrl = getPublicUrl(videoPath);
      const metadata = { original_filename: videoFile.name, size: videoFile.size };

      // Insert into videos table
      const { error } = await supabase.from("videos").insert({
        user_id: userId,
        title: title.trim(),
        description: description || null,
        category: selectedCategories,
        tags: parseTags(tagsRaw),
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        visibility,
        is_made_for_kids: isMadeForKids,
        is_premium: isPremium,
        metadata,
      });

      if (error) throw error;

      setSuccessMsg("✅ Vidéo uploadée et enregistrée avec succès !");
      setTitle("");
      setDescription("");
      setSelectedCategories([]);
      setTagsRaw("");
      setVideoFile(null);
      setThumbnailFile(null);
      setUploadProgress(0);
      setThumbProgress(0);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur lors de l'upload");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center px-4 py-12">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Uploader une nouvelle vidéo</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="md:col-span-2 space-y-4">
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

                {/* Categories in two columns */}
                <div>
                  <Label>Catégories</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {categories.map((cat) => (
                      <div key={cat} className="flex items-center gap-2">
                        <Switch
                          checked={selectedCategories.includes(cat)}
                          onCheckedChange={() => {
                            if (selectedCategories.includes(cat)) {
                              setSelectedCategories(selectedCategories.filter((c) => c !== cat));
                            } else {
                              setSelectedCategories([...selectedCategories, cat]);
                            }
                          }}
                        />
                        <span className="text-sm">{cat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Tags (séparés par des virgules)</Label>
                  <Input
                    value={tagsRaw}
                    onChange={(e) => setTagsRaw(e.target.value)}
                    placeholder="ex: voyage, paris, vlog"
                  />
                </div>

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
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <Label>Visibilité</Label>
                  <div className="flex flex-col gap-2 mt-1">
                    {(["public", "unlisted", "private"] as const).map((v) => (
                      <div key={v} className="flex items-center gap-2">
                        <Switch
                          checked={visibility === v}
                          onCheckedChange={() => setVisibility(v)}
                        />
                        <span className="text-sm">
                          {v === "unlisted" ? "Non listé" : v.charAt(0).toUpperCase() + v.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

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
              </div>
            </div>

            {/* Messages */}
            {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
            {successMsg && <p className="text-green-600 text-sm">{successMsg}</p>}

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setTitle("");
                  setDescription("");
                  setSelectedCategories([]);
                  setTagsRaw("");
                  setVideoFile(null);
                  setThumbnailFile(null);
                  setUploadProgress(0);
                  setThumbProgress(0);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  if (videoInputRef.current) videoInputRef.current.value = "";
                  if (thumbInputRef.current) thumbInputRef.current.value = "";
                }}
              >
                Réinitialiser
              </Button>

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
