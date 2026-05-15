"use client";

import { createPriceAlertAction } from "@/app/(protected)/alerts/actions";
import { useState } from "react";
import { toast } from "sonner";
import { Currency } from "@/lib/currency";
import { BellPlus, Loader2 } from "lucide-react";

type PriceAlertFormProps = {
  currency: Currency;
};

export function PriceAlertForm({
  currency,
}: PriceAlertFormProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const symbol = currency === "EUR" ? "€" : "$";

  async function handleAction(formData: FormData) {
    setError("");
    setLoading(true);

    try {
      await createPriceAlertAction(formData);
      toast.success("Alerte créée avec succès");
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
            Ticker
          </label>

          <input
            name="ticker"
            placeholder="Ex: AAPL"
            className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-bold text-white outline-none backdrop-blur-xl placeholder:text-slate-500 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-300">
            Prix cible
          </label>

          <input
            name="targetPrice"
            type="number"
            step="0.01"
            placeholder={`Prix cible en ${currency} (${symbol})`}
            className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-bold text-white outline-none backdrop-blur-xl placeholder:text-slate-500 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
          />
        </div>
      </div>

      <input type="hidden" name="currency" value={currency} />

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-300">
          Condition
        </label>

        <select
          name="direction"
          className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm font-bold text-white outline-none backdrop-blur-xl focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
        >
          <option value="ABOVE">
            Quand le prix monte au-dessus
          </option>
          <option value="BELOW">
            Quand le prix descend en-dessous
          </option>
        </select>
      </div>

      <button
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-sm font-bold text-emerald-300 backdrop-blur-xl transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-400/20 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Création...
          </>
        ) : (
          <>
            <BellPlus className="h-4 w-4" />
            Créer l’alerte
          </>
        )}
      </button>
    </form>
  );
}