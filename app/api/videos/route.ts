// /app/api/videos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Le champ title est requis" },
        { status: 400 }
      );
    }

    // Crée le client Supabase côté serveur avec cookies pour auth
    const supabase = await createClient();

    // Récupère l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 }
      );
    }

    // Insertion dans la table videos
    const { data, error } = await supabase
      .from("videos")
      .insert([{ title, user_id: user.id }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ video: data });
  } catch (err: unknown) {
    console.error("❌ Erreur API /videos:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}
