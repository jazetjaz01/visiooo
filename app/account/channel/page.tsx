"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  channel_id: string | null;
  channel?: Channel | null;
}

export default function ChannelPage() {
  const supabase = createClient();
  const params = useParams();
  const rawHandle = params?.handle as string;

  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // Formater les vues en k/M
  const formatViews = (views: number) => {
    if (views >= 1_000_000) return (views / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (views >= 1_000) return (views / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
    return views.toString();
  };

  useEffect(() => {
    async function fetchChannelAndVideos() {
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
        .select("*")
        .eq("channel_id", channelData.id)
        .order("created_at", { ascending: false });

      if (videosError) {
        console.error("Erreur chargement vidéos :", videosError);
      } else {
        const enrichedVideos = videosData.map((video) => ({ ...video, channel: channelData }));
        setVideos(enrichedVideos);
      }

      setLoading(false);
    }

    fetchChannelAndVideos();
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
    <div className="min-h-screen dark:bg-black text-black dark:text-white px-4 py-8 ">
      {/* Bannière */}
      <div className="relative w-full h-48 sm:h-64 bg-zinc-200 dark:bg-zinc-800 mb-4">
        {channel.banner_url ? (
          <Image src={channel.banner_url} alt="Bannière" fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Pas de bannière
          </div>
        )}
      </div>

      {/* Infos chaîne sous la bannière */}
      <div className="flex items-center gap-4 mb-8">
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
          {channel.description && (
            <p className="mt-2 text-gray-700 dark:text-gray-300 max-w-2xl">{channel.description}</p>
          )}
        </div>
      </div>

      {/* Liste des vidéos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="flex flex-col">
            {/* Miniature */}
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
            </Link>

            {/* Infos vidéo */}
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
                <Link
                  href={`/watch/${video.id}`}
                  className="font-semibold text-xl text-black dark:text-white line-clamp-2 hover:text-teal-600 transition-colors"
                >
                  {video.title}
                </Link>

                {video.channel && (
                  <Link
                    href={`/channel/${video.channel.handle.replace("@", "")}`}
                    className="text-base text-gray-600 dark:text-gray-400 mt-1 hover:underline"
                  >
                    {video.channel.name}
                  </Link>
                )}

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
