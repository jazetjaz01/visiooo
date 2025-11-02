"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Channel {
  id: string;
  name: string;
  handle: string;
  avatar_url: string | null;
}

interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  views_count: number;
  created_at: string;
  channel_id: string | null;
  channel?: Channel | null; // 👈 Ajout du lien avec la chaîne
}

export default function Home() {
  const supabase = createClient();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideosWithChannels() {
      // 1️⃣ Récupère toutes les vidéos
      const { data: videosData, error: videosError } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (videosError || !videosData) {
        console.error("Erreur lors du chargement des vidéos :", videosError);
        setLoading(false);
        return;
      }

      // 2️⃣ Pour chaque vidéo, récupère la chaîne associée
      const enrichedVideos: Video[] = await Promise.all(
        videosData.map(async (video) => {
          if (!video.channel_id) return video;

          const { data: channelData, error: channelError } = await supabase
            .from("channels")
            .select("id, name, handle, avatar_url")
            .eq("id", video.channel_id)
            .single();

          if (channelError) {
            console.warn("Erreur récupération chaîne :", channelError);
            return video;
          }

          return { ...video, channel: channelData };
        })
      );

      setVideos(enrichedVideos);
      setLoading(false);
    }

    fetchVideosWithChannels();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600 dark:text-gray-400">
        Chargement des vidéos...
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600 dark:text-gray-400">
        Aucune vidéo disponible pour le moment.
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-black px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-black dark:text-white">
        Vidéos récentes
      </h1>

      {/* Grille de vidéos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className="flex flex-col gap-2 hover:scale-[1.02] transition-transform duration-200"
          >
            {/* Miniature */}
            <div className="relative w-full h-48 bg-zinc-200 dark:bg-zinc-800 rounded-xl overflow-hidden">
              <Link href={`/watch/${video.id}`}>
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
              </Link>
            </div>

            {/* Infos vidéo */}
            <div className="flex flex-col gap-1">
              <Link
                href={`/watch/${video.id}`}
                className="text-sm font-semibold text-black dark:text-white line-clamp-2"
              >
                {video.title}
              </Link>

              <p className="text-xs text-gray-600 dark:text-gray-400">
                {video.views_count} vues •{" "}
                {new Date(video.created_at).toLocaleDateString()}
              </p>

              {/* Détails de la chaîne */}
              {video.channel && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-700">
                    {video.channel.avatar_url ? (
                      <Image
                        src={video.channel.avatar_url}
                        alt={video.channel.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-white font-semibold">
                        {video.channel.name[0]}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <Link
                      href={`/channel/${video.channel.handle.replace("@", "")}`}
                      className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:underline"
                    >
                      {video.channel.name}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
