"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function PortfolioFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q") ?? "";
  const currentSort = searchParams.get("sort") ?? "value-desc";

  const [q, setQ] = useState(currentQ);

  function buildUrl(qValue: string, sortValue: string) {
    const params = new URLSearchParams();

    if (qValue.trim()) {
      params.set("q", qValue.trim().toUpperCase());
    }

    if (sortValue) {
      params.set("sort", sortValue);
    }

    const query = params.toString();
    return query ? `/portfolio?${query}` : "/portfolio";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildUrl(q, currentSort));
  }

  function handleSortChange(sortValue: string) {
    router.push(buildUrl(q, sortValue));
  }

  function handleReset() {
    setQ("");
    router.push("/portfolio");
  }

  return (
    <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-3 sm:flex-row sm:items-center"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher ticker ex: AAPL"
          className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-medium text-white outline-none backdrop-blur-xl placeholder:text-slate-500 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 sm:max-w-xs"
        />

        <button
          type="submit"
          className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-sm font-bold text-emerald-300 transition hover:bg-emerald-400/20"
        >
          Rechercher
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="rounded-2xl border border-white/10 bg-white/4 px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/8"
        >
          Reset
        </button>
      </form>

      <select
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm font-bold text-white outline-none backdrop-blur-xl focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
      >
        <option value="value-desc">Valeur ↓</option>
        <option value="value-asc">Valeur ↑</option>
        <option value="profit-desc">Profit ↓</option>
        <option value="profit-asc">Profit ↑</option>
        <option value="ticker-asc">Ticker A-Z</option>
        <option value="ticker-desc">Ticker Z-A</option>
      </select>
    </div>
  );
}