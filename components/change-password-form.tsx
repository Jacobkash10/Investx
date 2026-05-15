"use client";

import { changePasswordAction } from "@/app/(protected)/profile/actions";
import { useState } from "react";
import { toast } from "sonner";
import {
  KeyRound,
  Loader2,
  LockKeyhole,
} from "lucide-react";

export function ChangePasswordForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAction(formData: FormData) {
    setError("");
    setLoading(true);

    try {
      await changePasswordAction(formData);

      toast.success(
        "Mot de passe modifié avec succès"
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Erreur inconnue";

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
            Mot de passe actuel
          </label>

          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              name="currentPassword"
              type="password"
              className="w-full rounded-2xl border border-white/10 bg-white/6 py-3 pl-11 pr-4 text-sm font-bold text-white outline-none backdrop-blur-xl placeholder:text-slate-500 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-300">
            Nouveau mot de passe
          </label>

          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              name="newPassword"
              type="password"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.06 py-3 pl-11 pr-4 text-sm font-bold text-white outline-none backdrop-blur-xl placeholder:text-slate-500 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      <button
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-sm font-bold text-emerald-300 backdrop-blur-xl transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-400/20 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Modification...
          </>
        ) : (
          <>
            <KeyRound className="h-4 w-4" />
            Modifier le mot de passe
          </>
        )}
      </button>
    </form>
  );
}