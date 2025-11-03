"use client";

import { useState } from "react";

interface ReportProfileButtonProps {
  profileId: string; // l'id du profil à signaler
}

export function ReportProfileButton({ profileId }: ReportProfileButtonProps) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setMessage("Veuillez fournir une raison du signalement.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/report-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, reason }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Erreur lors du signalement.");
      } else {
        setMessage("Profil signalé avec succès ✅");
        setReason(""); // reset
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur réseau lors du signalement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium mb-1">
        Raison du signalement
      </label>
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Expliquez pourquoi ce profil doit être signalé"
        className="w-full rounded border px-3 py-2 text-sm mb-2"
        disabled={loading}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? "Envoi..." : "Signaler le profil"}
      </button>
      {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
