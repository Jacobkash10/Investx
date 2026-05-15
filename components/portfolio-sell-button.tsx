"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, TrendingDown } from "lucide-react";

type PortfolioSellButtonProps = {
  ticker: string;
  maxQuantity: number;
};

export function PortfolioSellButton({
  ticker,
  maxQuantity,
}: PortfolioSellButtonProps) {
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  async function handleSell() {
    if (quantity <= 0) {
      toast.error("Quantité invalide");
      return;
    }

    if (quantity > maxQuantity) {
      toast.error(
        `Vous ne pouvez vendre que ${maxQuantity} action(s)`
      );

      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/trade/sell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticker,
          quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success(
        `Vente réussie : ${quantity} ${ticker}`
      );

      router.refresh();
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="1"
        max={maxQuantity}
        value={quantity}
        onChange={(e) =>
          setQuantity(Number(e.target.value))
        }
        className="w-20 rounded-2xl border border-white/10 bg-white/6 px-3 py-2 text-sm font-bold text-white outline-none backdrop-blur-xl transition focus:border-red-400/50 focus:ring-2 focus:ring-red-400/20"
      />

      <button
        type="button"
        onClick={() => setQuantity(maxQuantity)}
        className="rounded-2xl border border-white/10 bg-white/4 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/8"
      >
        Max
      </button>

      <button
        type="button"
        onClick={handleSell}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 backdrop-blur-xl transition-all duration-200 hover:bg-red-500/20 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Vente...
          </>
        ) : (
          <>
            <TrendingDown className="h-4 w-4" />
            Vendre
          </>
        )}
      </button>
    </div>
  );
}