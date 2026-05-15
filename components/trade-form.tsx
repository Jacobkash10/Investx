"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Loader2, ShieldCheck } from "lucide-react";

import { Currency, convertCurrency, formatCurrency } from "@/lib/currency";

type TradeFormProps = {
  ticker: string;
  currentPrice: number;
  ownedQuantity?: number;
  currency?: Currency;
};

export function TradeForm({
  ticker,
  currentPrice,
  ownedQuantity = 0,
  currency = "USD",
}: TradeFormProps) {
  const router = useRouter();

  const convertedCurrentPrice = convertCurrency(currentPrice, "USD", currency);

  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [limitPrice, setLimitPrice] = useState(convertedCurrentPrice);
  const [loading, setLoading] = useState<"BUY" | "SELL" | null>(null);

  const total = useMemo(() => {
    const price = orderType === "LIMIT" ? limitPrice : convertedCurrentPrice;
    return quantity * price;
  }, [quantity, orderType, limitPrice, convertedCurrentPrice]);

  async function handleTrade(side: "BUY" | "SELL") {
    if (quantity <= 0) {
      toast.error("La quantité doit être supérieure à 0");
      return;
    }

    if (orderType === "LIMIT" && limitPrice <= 0) {
      toast.error("Le prix limite doit être supérieur à 0");
      return;
    }

    if (side === "SELL" && quantity > ownedQuantity) {
      toast.error(`Vous ne possédez que ${ownedQuantity} action(s) ${ticker}`);
      return;
    }

    setLoading(side);

    const endpoint =
      orderType === "MARKET"
        ? side === "BUY"
          ? "/api/trade/buy"
          : "/api/trade/sell"
        : "/api/trade/limit";

    const limitPriceUsd =
      orderType === "LIMIT"
        ? convertCurrency(limitPrice, currency, "USD")
        : undefined;

    const body =
      orderType === "MARKET"
        ? { ticker, quantity }
        : { ticker, quantity, side, limitPrice: limitPriceUsd };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(null);

    if (!res.ok) {
      toast.error(data.error ?? "Une erreur est survenue");
      return;
    }

    toast.success(
      orderType === "MARKET"
        ? side === "BUY"
          ? `Achat réussi : ${quantity} ${ticker}`
          : `Vente réussie : ${quantity} ${ticker}`
        : `Ordre limite ${side} créé avec succès`
    );

    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Trading</p>
            <h3 className="text-2xl font-black text-white">{ticker}</h3>
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-right">
            <p className="text-xs text-emerald-300">Prix actuel</p>
            <p className="font-black text-white">
              {formatCurrency(convertedCurrentPrice, currency)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setOrderType("MARKET")}
            className={`rounded-2xl border p-3 text-sm font-bold transition ${
              orderType === "MARKET"
                ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300"
                : "border-white/10 bg-white/4 text-slate-300 hover:bg-white/8"
            }`}
          >
            Market Order
          </button>

          <button
            type="button"
            onClick={() => setOrderType("LIMIT")}
            className={`rounded-2xl border p-3 text-sm font-bold transition ${
              orderType === "LIMIT"
                ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-300"
                : "border-white/10 bg-white/4 text-slate-300 hover:bg-white/8"
            }`}
          >
            Limit Order
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Quantité">
          <input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 font-bold text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50"
          />
        </Field>

        {orderType === "LIMIT" ? (
          <Field label="Prix limite">
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={limitPrice}
              onChange={(e) => setLimitPrice(Number(e.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 font-bold text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
            />
          </Field>
        ) : (
          <MiniInfo
            label="Type d’exécution"
            value="Exécuté au prix actuel du marché"
          />
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <MiniInfo label="Détenu" value={`${ownedQuantity} action(s)`} />
        <MiniInfo
          label="Prix utilisé"
          value={formatCurrency(
            orderType === "LIMIT" ? limitPrice : convertedCurrentPrice,
            currency
          )}
        />
        <MiniInfo label="Total estimé" value={formatCurrency(total, currency)} />
      </div>

      {ownedQuantity > 0 && (
        <button
          type="button"
          onClick={() => setQuantity(ownedQuantity)}
          className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/8"
        >
          Utiliser la quantité maximum disponible
        </button>
      )}

      <div className="rounded-3xl border border-white/10 bg-white/4 p-4">
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          Vérifiez les informations avant de confirmer l’ordre.
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => handleTrade("BUY")}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-4 font-black text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === "BUY" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowUp className="h-5 w-5" />
            )}
            Acheter
          </button>

          <button
            type="button"
            disabled={loading !== null}
            onClick={() => handleTrade("SELL")}
            className="flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-4 font-black text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === "SELL" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowDown className="h-5 w-5" />
            )}
            Vendre
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-400">
        {label}
      </label>
      {children}
    </div>
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