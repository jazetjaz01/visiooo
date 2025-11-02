"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Channel {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  subscribers_count: number;
}

interface Video {
  id: string;
  title: string;
  thumbnail_url: string | null;
  video_url: string;
  views_count: number;
}

export default function ChannelPage() {
  const supabase = createClient();
  const params = useParams();
  const rawHandle = params?.handle as string;

  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // Fonction utilitaire pour formater les vues en k / M
  const formatViews = (views: number) => {
    if (views >= 1_000_000) return (views / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (views >= 1_000) return (views / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
    return views.toString();
  };

  useEffect(() => {
    async function fetchChannel() {
      if (!rawHandle) return;

      const { data: channelData, error: channelError } = await supabase
        .from("channels")
        .select("*")
        .eq("handle", rawHandle)
        .single();

      if (channelError || !channelData) {
        console.error("Erreur chargement chaîne :", channelError);
        setLoading(false);
        return;
      }

      setChannel(channelData);

      const { data: videosData, error: videosError } = await supabase
        .from("videos")
        .select("id, title, thumbnail_url, video_url, views_count")
        .eq("channel_id", channelData.id)
        .order("created_at", { ascending: false });

      if (videosError) console.error("Erreur chargement vidéos :", videosError);
      else setVideos(videosData || []);

      setLoading(false);
    }

    fetchChannel();
  }, [rawHandle, supabase]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600 dark:text-gray-400">
        Chargement de la chaîne...
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600 dark:text-gray-400">
        Chaîne introuvable.
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-black text-black dark:text-white">
      {/* Bannière */}
      <div className="relative w-full h-48 sm:h-64 bg-zinc-200 dark:bg-zinc-800">
        {channel.banner_url ? (
          <Image src={channel.banner_url} alt="Bannière" fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Pas de bannière
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-12">
        <div className="flex items-end gap-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-zinc-900">
            {channel.avatar_url ? (
              <Image src={channel.avatar_url} alt={channel.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-white text-xl">
                {channel.name[0]}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{channel.name}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">@{channel.handle}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {channel.subscribers_count} abonnés
            </p>
          </div>
        </div>

        {channel.description && (
          <p className="mt-4 text-gray-700 dark:text-gray-300 max-w-2xl">{channel.description}</p>
        )}

        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Vidéos</h2>

          {videos.length === 0 ? (
            <p className="text-gray-500">Aucune vidéo publiée pour le moment.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {videos.map((video) => (
                <a key={video.id} href={`/watch/${video.id}`} className="flex flex-col gap-2 group">
                  <div className="relative w-full h-60 bg-zinc-200 dark:bg-zinc-800 rounded-md overflow-hidden">
                    {video.thumbnail_url ? (
                      <Image
                        src={video.thumbnail_url}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:opacity-90 transition"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        Pas de miniature
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold line-clamp-2">{video.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatViews(video.views_count)} vues
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
