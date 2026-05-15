"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function HistoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSide = searchParams.get("side") ?? "ALL";
  const currentTicker = searchParams.get("ticker") ?? "";

  const [ticker, setTicker] = useState(currentTicker);

  function buildUrl(side: string, tickerValue: string) {
    const params = new URLSearchParams();

    if (side !== "ALL") {
      params.set("side", side);
    }

    if (tickerValue.trim()) {
      params.set("ticker", tickerValue.trim().toUpperCase());
    }

    const query = params.toString();

    return query ? `/history?${query}` : "/history";
  }

  function handleSideChange(side: string) {
    router.push(buildUrl(side, ticker));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildUrl(currentSide, ticker));
  }

  function handleReset() {
    setTicker("");
    router.push("/history");
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {["ALL", "BUY", "SELL"].map((side) => (
          <button
            key={side}
            type="button"
            onClick={() => handleSideChange(side)}
            className={`rounded-lg border px-4 py-2 text-sm ${
              currentSide === side
                ? "bg-black text-white"
                : "bg-white text-gray-700"
            }`}
          >
            {side}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Filtrer par ticker ex: AAPL"
          className="w-full max-w-xs rounded-lg border p-2"
        />

        <button className="rounded-lg bg-black px-4 py-2 text-sm text-white">
          Rechercher
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border px-4 py-2 text-sm"
        >
          Réinitialiser
        </button>
      </form>
    </div>
  );
}