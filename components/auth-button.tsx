"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useActiveProfile } from "./ActiveProfilContext";
import { Logo } from "./logo"; // ton composant icône

export function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const supabase = createClient();
  const { profile, setProfile } = useActiveProfile();

  useEffect(() => {
    const loadUserAndChannels = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        await fetchChannels(data.user.id, data.user);
      }
    };

    loadUserAndChannels();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchChannels(session.user.id, session.user);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  const fetchChannels = async (userId: string, userData: any) => {
    const { data: channelData } = await supabase
      .from("channels")
      .select("*")
      .eq("user_id", userId);

    setChannels(channelData || []);

    // Profil actif par défaut sur l'utilisateur
    setProfile({
      type: "user",
      id: userId,
      name: userData.user_metadata?.full_name || userData.email,
      avatar_url: userData.user_metadata?.avatar_url || "/default-avatar.png",
    });
  };

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full border border-gray-300 p-1 hover:bg-gray-100 dark:hover:bg-zinc-800">
            <Image
              src={profile?.avatar_url || "/default-avatar.png"}
              alt={profile?.name || "Profil"}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56">
          {/* === Section 1 : Profil actif et ses chaînes === */}
          <DropdownMenuItem
            onSelect={() =>
              setProfile({
                type: "user",
                id: user.id,
                name: user.user_metadata?.full_name || user.email,
                avatar_url: user.user_metadata?.avatar_url || "/default-avatar.png",
              })
            }
          >
            <div className="flex items-center gap-2">
              <Image
                src={user.user_metadata?.avatar_url || "/default-avatar.png"}
                alt="Profil"
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
              <span>Profil</span>
            </div>
          </DropdownMenuItem>

          {channels.map((channel) => (
            <DropdownMenuItem
              key={channel.id}
              onSelect={() =>
                setProfile({
                  type: "channel",
                  id: channel.id,
                  name: channel.name,
                  avatar_url: channel.avatar_url,
                  handle: channel.handle,
                })
              }
            >
              <div className="flex items-center gap-2">
                <Image
                  src={channel.avatar_url || "/default-avatar.png"}
                  alt={channel.name}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
                <span>{channel.name}</span>
              </div>
            </DropdownMenuItem>
          ))}

          {/* === Section 2 : Changer de compte (optionnel, ici on peut répéter l’utilisateur et ses chaînes) === */}
          <div className="border-t my-2" />

          <DropdownMenuItem>
            <span className="text-xs font-semibold text-gray-500">Changer de compte</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() =>
              setProfile({
                type: "user",
                id: user.id,
                name: user.user_metadata?.full_name || user.email,
                avatar_url: user.user_metadata?.avatar_url || "/default-avatar.png",
              })
            }
          >
            <div className="flex items-center gap-2">
              <Image
                src={user.user_metadata?.avatar_url || "/default-avatar.png"}
                alt="Profil"
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
              <span>{user.user_metadata?.full_name || user.email}</span>
            </div>
          </DropdownMenuItem>

          {channels.map((channel) => (
            <DropdownMenuItem
              key={channel.id + "-switch"}
              onSelect={() =>
                setProfile({
                  type: "channel",
                  id: channel.id,
                  name: channel.name,
                  avatar_url: channel.avatar_url,
                  handle: channel.handle,
                })
              }
            >
              <div className="flex items-center gap-2">
                <Image
                  src={channel.avatar_url || "/default-avatar.png"}
                  alt={channel.name}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
                <span>{channel.name}</span>
              </div>
            </DropdownMenuItem>
          ))}

          {/* === Section 3 : Déconnexion === */}
          <div className="border-t my-2" />
          <DropdownMenuItem asChild>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 text-black"
              onClick={async () => {
                await supabase.auth.signOut();
                setProfile(null); // ✅ maintenant autorisé
              }}
            >
              <Logo className="w-4 h-4" />
              <span>Déconnexion</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex gap-2">
      <Link
        href="/auth/login"
        className="rounded-full border px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800"
      >
        Se connecter
      </Link>
      <Link
        href="/auth/sign-up"
        className="rounded-full border px-3 py-1 text-sm hidden sm:inline-flex hover:bg-gray-100 dark:hover:bg-zinc-800"
      >
        S'enregistrer
      </Link>
    </div>
  );
}
