import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

import DynamicSidebarLayout from "@/components/dynamic-sidebar-layout";

const outfitSans = Outfit({
  variable: "--font-outfit-sans",
  display: "swap",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Visiooo",
  description: "Application de vidéos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${outfitSans.className} antialiased`}>
        <DynamicSidebarLayout>{children}</DynamicSidebarLayout>
      </body>
    </html>
  );
}
