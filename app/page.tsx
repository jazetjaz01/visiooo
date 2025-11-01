"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: string[] | null | string; // JSON string ou tableau
  views_count: number;
  created_at: string;
}

export default function Home() {
  const supabase = createClient();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Erreur lors de la récupération des vidéos :", error);
        setLoading(false);
        return;
      }

      // Parse les catégories si elles sont en JSON string
      const videosWithParsedCategories = (data as Video[]).map((v) => ({
        ...v,
        category: typeof v.category === "string" ? JSON.parse(v.category) : v.category,
      }));

      setVideos(videosWithParsedCategories);
      setLoading(false);
    }

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Chargement des vidéos...</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Aucune vidéo disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-black dark:text-white">Mes videos ici</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="flex flex-col gap-2">
            {/* Miniature */}
            <div className="relative w-full h-48 bg-zinc-200 dark:bg-zinc-800 rounded-md overflow-hidden">
              <a href={`/watch/${video.id}`}>
                {video.thumbnail_url ? (
                  <Image
                    src={video.thumbnail_url}
                    alt={video.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    Pas de miniature
                  </div>
                )}
              </a>
            </div>

            {/* Infos vidéo */}
            <div className="flex flex-col gap-1">
              <a
                href={`/watch/${video.id}`}
                className="text-sm font-semibold text-black dark:text-white line-clamp-2"
              >
                {video.title}
              </a>

              {video.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {video.description}
                </p>
              )}

              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2 mt-1">
                {video.category && <span>{video.category.join(", ")}</span>}
                <span>{video.views_count} vues</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
