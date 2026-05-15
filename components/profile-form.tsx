"use client";

import { updateProfileAction } from "@/app/(protected)/profile/actions";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

type ProfileFormProps = {
  name: string;
  image?: string | null;
  preferredCurrency?: "USD" | "EUR";
};

export function ProfileForm({
  name,
  image,
  preferredCurrency = "USD",
}: ProfileFormProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAction(formData: FormData) {
    setError("");
    setLoading(true);

    try {
      await updateProfileAction(formData);
      toast.success("Profil mis à jour avec succès");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur inconnue";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleAction} className="space-y-5">
      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-bold text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-300">
            Nom
          </label>

          <input
            name="name"
            defaultValue={name}
            className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-bold text-white outline-none backdrop-blur-xl placeholder:text-slate-500 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
            placeholder="Votre nom"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-300">
            URL Avatar
          </label>

          <input
            name="image"
            defaultValue={image ?? ""}
            className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-bold text-white outline-none backdrop-blur-xl placeholder:text-slate-500 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
            placeholder="https://example.com/avatar.png"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-300">
          Devise préférée
        </label>

        <select
          name="preferredCurrency"
          defaultValue={preferredCurrency}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm font-bold text-white outline-none backdrop-blur-xl focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
        >
          <option value="USD">USD - Dollar américain</option>
          <option value="EUR">EUR - Euro</option>
        </select>
      </div>

      <button
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-sm font-bold text-emerald-300 backdrop-blur-xl transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-400/20 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Enregistrer
          </>
        )}
      </button>
    </form>
  );
}