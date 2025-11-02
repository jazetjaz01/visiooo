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
  channel?: Channel | null;
}

export default function Home() {
  const supabase = createClient();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // Fonction utilitaire pour formater les vues en k / M
  const formatViews = (views: number) => {
    if (views >= 1_000_000) {
      return (views / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (views >= 1_000) {
      return (views / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return views.toString();
  };

  useEffect(() => {
    async function fetchVideosWithChannels() {
      const { data: videosData, error: videosError } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (videosError || !videosData) {
        console.error("Erreur chargement vidéos :", videosError);
        setLoading(false);
        return;
      }

      // Enrichir chaque vidéo avec sa chaîne
      const enrichedVideos: Video[] = await Promise.all(
        videosData.map(async (video) => {
          if (!video.channel_id) return video;

          const { data: channelData } = await supabase
            .from("channels")
            .select("id, name, handle, avatar_url")
            .eq("id", video.channel_id)
            .single();

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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {videos.map((video) => (
          <div key={video.id} className="flex flex-col">
            {/* Miniature avec hover */}
            <Link
              href={`/watch/${video.id}`}
              className="group relative w-full aspect-video bg-zinc-200 dark:bg-zinc-800 rounded-xl overflow-hidden"
            >
              {video.thumbnail_url ? (
                <Image
                  src={video.thumbnail_url}
                  alt={video.title}
                  fill
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  Pas de miniature
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
            </Link>

            {/* Infos principales */}
            <div className="flex mt-3 gap-3">
              {video.channel && (
                <Link
                  href={`/channel/${video.channel.handle.replace("@", "")}`}
                  className="flex-shrink-0"
                >
                  <div className="relative w-9 h-9 rounded-full overflow-hidden bg-zinc-700">
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
                </Link>
              )}

              <div className="flex flex-col">
                {/* Titre vidéo */}
                <Link
                  href={`/watch/${video.id}`}
                  className="font-semibold text-xl text-black dark:text-white line-clamp-2 hover:text-teal-600 transition-colors"
                >
                  {video.title}
                </Link>

                {/* Nom de la chaîne */}
                {video.channel && (
                  <Link
                    href={`/channel/${video.channel.handle.replace("@", "")}`}
                    className="text-base text-gray-600 dark:text-gray-400 mt-1 hover:underline"
                  >
                    {video.channel.name}
                  </Link>
                )}

                {/* Compteur de vues formaté */}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatViews(video.views_count)} vues
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
