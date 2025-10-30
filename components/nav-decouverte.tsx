"use client"

import {
  Star,
  Globe2,
  Music,
  Film,
  Tv,
  Radio,
  Gamepad2,
  Newspaper,
  Dumbbell,
  Laugh,
  Mic2,
  Car,
} from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavDecouverte() {
  const items = [
    { name: "Légendaires", url: "/decouverte/legendaires", icon: Star },
    { name: "Voyages", url: "/decouverte/voyages", icon: Globe2 },
    { name: "Musiques", url: "/decouverte/musiques", icon: Music },
    { name: "Cinéma", url: "/decouverte/cinema", icon: Film },
    { name: "Séries TV", url: "/decouverte/series-tv", icon: Tv },
    { name: "Direct", url: "/decouverte/direct", icon: Radio },
    { name: "Jeux vidéo", url: "/decouverte/jeux-video", icon: Gamepad2 },
    { name: "Actualité", url: "/decouverte/actualite", icon: Newspaper },
    { name: "Sports", url: "/decouverte/sports", icon: Dumbbell },
    { name: "Humour", url: "/decouverte/humour", icon: Laugh },
    { name: "Podcasts", url: "/decouverte/podcasts", icon: Mic2 },
    { name: "Voitures", url: "/decouverte/voitures", icon: Car },
  ]

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Découverte</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url} className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
