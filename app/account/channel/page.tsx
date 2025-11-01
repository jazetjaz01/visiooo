"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Channel {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  subscribers_count: number;
}

export default function ChannelListPage() {
  const supabase = createClient();
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChannels() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Veuillez vous connecter pour voir vos chaînes.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur récupération chaînes :", error);
      } else {
        setChannels(data || []);
      }

      setLoading(false);
    }

    fetchChannels();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600 dark:text-gray-400">
        Chargement des chaînes...
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600 dark:text-gray-400">
        Vous n'avez pas encore créé de chaîne.
      </div>
    );
  }

  return (
    <div className="flex justify-center  dark:bg-black min-h-screen p-6">
      <div className="w-full max-w-5xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Mes chaînes</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className="flex flex-col items-start gap-2 cursor-pointer hover:shadow-md p-4 rounded-lg bg-white dark:bg-zinc-800 transition"
              onClick={() => router.push(`/account/channel/${channel.handle}`)}
            >
              <div className="relative w-20 h-20 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700">
                {channel.avatar_url ? (
                  <Image
                    src={channel.avatar_url}
                    alt={channel.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-700 text-white text-xl">
                    {channel.name[0]}
                  </div>
                )}
              </div>
              <h2 className="text-lg font-semibold">{channel.name}</h2>
              {channel.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {channel.description}
                </p>
              )}
              <p className="text-xs text-gray-400">{channel.subscribers_count} abonnés</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
