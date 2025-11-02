"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  views_count: number;
  created_at: string;
  channel_id: string | null;
}

interface Channel {
  id: string;
  name: string;
  handle: string;
  avatar_url: string | null;
  subscribers_count: number;
}

export default function WatchPage() {
  const supabase = createClient();
  const params = useParams();
  const videoId = params?.id as string;

  const [video, setVideo] = useState<Video | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonction utilitaire pour formater les vues
  const formatViews = (views: number) => {
    if (views >= 1_000_000) {
      return (views / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (views >= 1_000) {
      return (views / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return views.toString();
  };

  // Incrémenter les vues une seule fois par visiteur
  const handleView = async () => {
    if (!video) return;

    const viewedVideos: string[] = JSON.parse(localStorage.getItem("viewedVideos") || "[]");

    if (!viewedVideos.includes(video.id)) {
      try {
        await supabase
          .from("videos")
          .update({ views_count: (video.views_count || 0) + 1 })
          .eq("id", video.id);

        setVideo({ ...video, views_count: (video.views_count || 0) + 1 });
        localStorage.setItem("viewedVideos", JSON.stringify([...viewedVideos, video.id]));
      } catch (err) {
        console.error("Erreur compteur de vues :", err);
      }
    }
  };

  useEffect(() => {
    async function fetchVideoAndChannel() {
      if (!videoId) return;

      // Récupération de la vidéo
      const { data: videoData, error: videoError } = await supabase
        .from("videos")
        .select("*")
        .eq("id", videoId)
        .single();

      if (videoError || !videoData) {
        console.error("Erreur chargement vidéo :", videoError);
        setLoading(false);
        return;
      }

      setVideo(videoData);

      // Récupération de la chaîne
      if (videoData.channel_id) {
        const { data: channelData, error: channelError } = await supabase
          .from("channels")
          .select("id, name, handle, avatar_url, subscribers_count")
          .eq("id", videoData.channel_id)
          .single();

        if (channelError) {
          console.error("Erreur chargement chaîne :", channelError);
        } else {
          setChannel(channelData);
        }
      }

      setLoading(false);
    }

    fetchVideoAndChannel();
  }, [videoId, supabase]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600 dark:text-gray-400">
        Chargement de la vidéo...
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600 dark:text-gray-400">
        Vidéo introuvable.
      </div>
    );
  }

  return (
    <div className="min-h-screen  dark:bg-black text-black dark:text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Vidéo principale */}
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
          <video
            src={video.video_url}
            controls
            className="w-full h-full object-contain"
            onPlay={handleView}
          />
        </div>

        {/* Informations de la vidéo */}
        <div className="mt-4">
          <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {formatViews(video.views_count)} vues
          </div>
        </div>

        {/* Infos de la chaîne */}
        {channel && (
          <div className="flex items-center justify-between mt-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <a
                href={`/channel/${channel.handle.replace("@", "")}`}
                className="flex items-center gap-3"
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-700">
                  {channel.avatar_url ? (
                    <Image
                      src={channel.avatar_url}
                      alt={channel.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white font-semibold">
                      {channel.name[0]}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold">{channel.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {channel.handle} • {channel.subscribers_count} abonnés
                  </p>
                </div>
              </a>
            </div>

            <button className="px-4 py-2 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition">
              S’abonner
            </button>
          </div>
        )}

        {/* Description */}
        {video.description && (
          <div className="mt-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {video.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
