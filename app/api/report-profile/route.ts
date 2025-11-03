// /app/api/report-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profileId, reason } = body;

    if (!profileId || !reason) {
      return NextResponse.json(
        { error: "profileId et reason sont requis" },
        { status: 400 }
      );
    }

    // Crée le client Supabase côté serveur avec cookies pour auth
    const supabase = await createClient();

    // Récupère l'utilisateur connecté
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 }
      );
    }

    // Insertion dans la table profile_reports
    const { data, error } = await supabase
      .from("profile_reports")
      .insert([
        {
          profile_id: profileId, // référence à profiles.id
          reported_by: user.id,  // qui signale
          reason,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ report: data });
  } catch (err: unknown) {
    console.error("❌ Erreur API /report-profile:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}
