"use client";

import { createPriceAlertAction } from "@/app/(protected)/alerts/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BellRing, Loader2, TrendingDown, TrendingUp } from "lucide-react";

import { Currency, formatCurrency } from "@/lib/currency";

type QuickPriceAlertFormProps = {
  ticker: string;
  currentPrice: number;
  currency?: Currency;
};

export function QuickPriceAlertForm({
  ticker,
  currentPrice,
  currency = "USD",
}: QuickPriceAlertFormProps) {
  const router = useRouter();

  const [targetPrice, setTargetPrice] = useState(currentPrice);
  const [direction, setDirection] = useState<"ABOVE" | "BELOW">("ABOVE");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (targetPrice <= 0) {
      toast.error("Le prix cible doit être supérieur à 0");
      return;
    }

    setLoading(true);

    const formData = new FormData();

    formData.append("ticker", ticker);
    formData.append("targetPrice", String(targetPrice));
    formData.append("direction", direction);

    try {
      await createPriceAlertAction(formData);

      toast.success(`Alerte créée pour ${ticker}`);

      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur création alerte"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-4xl border border-white/10 bg-white/6 p-5 text-white backdrop-blur-xl"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-300">
            <BellRing className="h-4 w-4" />
            Alerte rapide
          </div>

          <h2 className="text-2xl font-black">Surveiller {ticker}</h2>

          <p className="mt-2 text-sm text-slate-400">
            Créez une alerte automatique quand le prix atteint votre condition.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-right">
          <p className="text-xs font-semibold text-emerald-300">Prix actuel</p>
          <p className="text-xl font-black text-white">
            {formatCurrency(currentPrice, currency)}
          </p>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setDirection("ABOVE")}
          className={`rounded-2xl border p-4 text-left transition ${
            direction === "ABOVE"
              ? "border-emerald-400/40 bg-emerald-400/15"
              : "border-white/10 bg-slate-950/60 hover:bg-white/8"
          }`}
        >
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <span className="font-black text-white">Au-dessus</span>
          </div>
          <p className="text-sm text-slate-400">
            Alerte quand le prix monte au-dessus du prix cible.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setDirection("BELOW")}
          className={`rounded-2xl border p-4 text-left transition ${
            direction === "BELOW"
              ? "border-red-400/40 bg-red-400/15"
              : "border-white/10 bg-slate-950/60 hover:bg-white/8"
          }`}
        >
          <div className="mb-3 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-400" />
            <span className="font-black text-white">En-dessous</span>
          </div>
          <p className="text-sm text-slate-400">
            Alerte quand le prix descend en-dessous du prix cible.
          </p>
        </button>
      </div>

      <div className="mb-5">
        <label className="mb-2 block text-sm font-semibold text-slate-400">
          Prix cible
        </label>

        <input
          type="number"
          step="0.01"
          min="0.01"
          value={targetPrice}
          onChange={(e) => setTargetPrice(Number(e.target.value))}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-lg font-black text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
        />
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <MiniInfo label="Ticker" value={ticker} />
        <MiniInfo
          label="Condition"
          value={direction === "ABOVE" ? "Prix au-dessus" : "Prix en-dessous"}
        />
        <MiniInfo label="Cible" value={formatCurrency(targetPrice, currency)} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-4 font-black text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Création...
          </>
        ) : (
          <>
            <BellRing className="h-5 w-5" />
            Créer l’alerte
          </>
        )}
      </button>
    </form>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 font-black text-white">{value}</p>
    </div>
  );
}