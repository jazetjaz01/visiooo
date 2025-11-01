"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: string[] | null | string;
  views_count: number;
  created_at: string;
}

export default function WatchPage() {
  const { id } = useParams();
  const supabase = createClient();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchVideo() {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erreur lors de la récupération de la vidéo :", error);
        setLoading(false);
        return;
      }

      const parsedVideo: Video = {
        ...data,
        category:
          typeof data.category === "string" ? JSON.parse(data.category) : data.category,
      };

      setVideo(parsedVideo);
      setLoading(false);
    }

    fetchVideo();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Chargement de la vidéo...</p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Vidéo introuvable.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black px-4 py-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        {/* Lecteur vidéo */}
        <video
          src={video.video_url}
          controls
          poster={video.thumbnail_url || undefined}
          className="w-full rounded-md bg-black"
        />

        {/* Titre */}
        <h1 className="text-2xl font-bold text-black dark:text-white mt-2">
          {video.title}
        </h1>

        {/* Catégories */}
        {video.category && video.category.length > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Catégorie : {video.category.join(", ")}
          </p>
        )}

        {/* Vues */}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {video.views_count} vues
        </p>

        {/* Description */}
        {video.description && (
          <p className="mt-2 text-gray-800 dark:text-gray-200">
            {video.description}
          </p>
        )}
      </div>
    </div>
  );
}
