import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getFinnhubQuote } from "@/lib/finnhub";
import { getCurrentUser } from "@/lib/get-current-user";

import {
  Currency,
  convertCurrency,
  formatCurrency,
} from "@/lib/currency";

import { AddToWatchlistButton } from "@/components/add-to-watchlist-button";
import { SyncAssetsButton } from "@/components/sync-assets-button";
import { Pagination } from "@/components/pagination";

import {
  ArrowRight,
  Search,
  TrendingDown,
  TrendingUp,
  Activity,
  Sparkles,
} from "lucide-react";

type MarketPageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};

const TOP_MARKET_TICKERS = [
  "AAPL",
  "MSFT",
  "NVDA",
  "TSLA",
  "AMZN",
  "GOOGL",
  "DIS"
];

export default async function MarketPage({
  searchParams,
}: MarketPageProps) {
  const params = await searchParams;

  const user = await getCurrentUser();

  const dbUser = user
    ? await prisma.user.findUnique({
        where: { id: user.id },
        select: { preferredCurrency: true },
      })
    : null;

  const displayCurrency = (
    dbUser?.preferredCurrency === "EUR" ? "EUR" : "USD"
  ) as Currency;

  const q = params.q?.trim();

  const page = Math.max(Number(params.page ?? 1), 1);

  const limit = 12;
  const skip = (page - 1) * limit;

  const where = q
    ? {
        OR: [
          {
            ticker: {
              contains: q.toUpperCase(),
              mode: "insensitive" as const,
            },
          },
          {
            name: {
              contains: q,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : {
        ticker: {
          notIn: TOP_MARKET_TICKERS,
        },
      };

  const topAssets = await prisma.asset.findMany({
    where: {
      ticker: {
        in: TOP_MARKET_TICKERS,
      },
    },
    orderBy: {
      ticker: "asc",
    },
  });

  const totalAssets = await prisma.asset.count({
    where,
  });

  const totalPages = Math.ceil(totalAssets / limit);

  const assets = await prisma.asset.findMany({
    where,
    orderBy: {
      ticker: "asc",
    },
    skip,
    take: limit,
  });

  const topAssetsWithQuotes = await Promise.all(
    topAssets.map(async (asset) => {
      try {
        const quote = await getFinnhubQuote(asset.ticker);

        return {
          ...asset,
          price: quote.c,
          change: quote.d,
          changePercent: quote.dp,
          high: quote.h,
          low: quote.l,
          success: true,
        };
      } catch {
        return {
          ...asset,
          price: 0,
          change: 0,
          changePercent: 0,
          high: 0,
          low: 0,
          success: false,
        };
      }
    })
  );

  const assetsWithQuotes = await Promise.all(
    assets.map(async (asset) => {
      try {
        const quote = await getFinnhubQuote(asset.ticker);

        return {
          ...asset,
          price: quote.c,
          change: quote.d,
          changePercent: quote.dp,
          high: quote.h,
          low: quote.l,
          success: true,
        };
      } catch {
        return {
          ...asset,
          price: 0,
          change: 0,
          changePercent: 0,
          high: 0,
          low: 0,
          success: false,
        };
      }
    })
  );

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none fixed left-1/2 top-0 h-125 w-125 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="pointer-events-none fixed right-0 top-40 h-100 w-100 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
              Marchés financiers • Live Data
            </div>

            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              Explorer le marché.
            </h1>

            <p className="mt-4 max-w-2xl text-slate-400">
              Recherchez des actions, analysez les prix, suivez les tendances
              et ouvrez des positions avec une interface moderne.
            </p>
          </div>

          <SyncAssetsButton />
        </section>

        {/* SEARCH */}
        <section className="mb-8 rounded-4xl border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
          <form action="/market" className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                name="q"
                defaultValue={q ?? ""}
                placeholder="Rechercher AAPL, TSLA, Apple..."
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-950/70 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/40"
              />
            </div>

            <button className="h-14 rounded-2xl bg-emerald-400 px-6 font-black text-slate-950 transition hover:bg-emerald-300">
              Rechercher
            </button>

            {q && (
              <Link
                href="/market"
                className="flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 font-bold text-white transition hover:bg-white/10"
              >
                Reset
              </Link>
            )}
          </form>
        </section>

        {/* TOP MARKET */}
        {!q && topAssetsWithQuotes.length > 0 && (
          <section className="mb-8">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Top du marché</h2>

                <p className="text-slate-400">
                  Les actions les plus suivies actuellement.
                </p>
              </div>

              <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300 md:flex">
                <Sparkles size={16} />
                Trending assets
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {topAssetsWithQuotes.map((asset) => (
                <MarketCard
                  key={asset.id}
                  asset={asset}
                  displayCurrency={displayCurrency}
                />
              ))}
            </div>
          </section>
        )}

        {/* ALL ASSETS */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-black">
              {q ? "Résultats de recherche" : "Autres actions"}
            </h2>

            <p className="text-slate-400">
              Analysez et explorez les opportunités du marché.
            </p>
          </div>

          {assetsWithQuotes.length === 0 ? (
            <div className="rounded-4xl border border-dashed border-white/10 bg-white/3 p-10 text-center">
              <p className="font-bold text-white">
                Aucune action trouvée.
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Synchronisez les assets ou essayez une autre recherche.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {assetsWithQuotes.map((asset) => (
                <MarketCard
                  key={asset.id}
                  asset={asset}
                  displayCurrency={displayCurrency}
                />
              ))}
            </div>
          )}
        </section>

        {/* PAGINATION */}
        <div className="mt-8">
          <Pagination
            page={page}
            totalPages={totalPages}
            basePath="/market"
            searchParams={{
              q,
            }}
          />
        </div>
      </div>
    </main>
  );
}

type MarketCardProps = {
  asset: {
    id: string;
    ticker: string;
    name: string;
    exchange: string | null;
    price: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    success: boolean;
  };
  displayCurrency: Currency;
};

function MarketCard({
  asset,
  displayCurrency,
}: MarketCardProps) {
  const isUp = asset.changePercent >= 0;

  return (
    <div className="group rounded-4xl border border-white/10 bg-white/6 p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-emerald-400/20 hover:bg-white/8">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
              isUp
                ? "bg-emerald-400/10 text-emerald-300"
                : "bg-red-400/10 text-red-300"
            }`}
          >
            {isUp ? (
              <TrendingUp size={24} />
            ) : (
              <TrendingDown size={24} />
            )}
          </div>

          <div>
            <h2 className="text-2xl font-black">
              {asset.ticker}
            </h2>

            <p className="line-clamp-1 text-sm text-slate-400">
              {asset.name}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {asset.exchange ?? "US"} • {displayCurrency}
            </p>
          </div>
        </div>

        {asset.success && (
          <div
            className={`rounded-full px-3 py-1 text-sm font-black ${
              isUp
                ? "bg-emerald-400/10 text-emerald-300"
                : "bg-red-400/10 text-red-300"
            }`}
          >
            {isUp ? "+" : ""}
            {asset.changePercent.toFixed(2)}%
          </div>
        )}
      </div>

      {asset.success ? (
        <>
          <div className="mb-5">
            <p className="text-sm text-slate-400">
              Prix actuel
            </p>

            <div className="mt-2 flex items-end justify-between">
              <h3 className="text-3xl font-black">
                {formatCurrency(
                  convertCurrency(
                    Number(asset.price ?? 0),
                    "USD",
                    displayCurrency
                  ),
                  displayCurrency
                )}
              </h3>

              <p
                className={`text-sm font-bold ${
                  isUp
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {isUp ? "+" : ""}
                {formatCurrency(
                  convertCurrency(
                    Number(asset.change ?? 0),
                    "USD",
                    displayCurrency
                  ),
                  displayCurrency
                )}
              </p>
            </div>
          </div>

          <div className="mb-5 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm">
            <div>
              <p className="text-slate-500">Bas</p>

              <p className="mt-1 font-bold text-white">
                {formatCurrency(
                  convertCurrency(
                    Number(asset.low ?? 0),
                    "USD",
                    displayCurrency
                  ),
                  displayCurrency
                )}
              </p>
            </div>

            <div className="h-10 w-px bg-white/10" />

            <div className="text-right">
              <p className="text-slate-500">Haut</p>

              <p className="mt-1 font-bold text-white">
                {formatCurrency(
                  convertCurrency(
                    Number(asset.high ?? 0),
                    "USD",
                    displayCurrency
                  ),
                  displayCurrency
                )}
              </p>
            </div>
          </div>

          <MiniTrend isUp={isUp} />

          <div className="mt-5 flex gap-3">
            <Link
              href={`/market/${asset.ticker}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
            >
              Voir / Trader
              <ArrowRight size={16} />
            </Link>

            <AddToWatchlistButton ticker={asset.ticker} />
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-red-400/10 bg-red-400/10 p-4 text-sm text-red-300">
            Prix indisponible pour le moment.
          </div>

          <Link
            href={`/market/${asset.ticker}`}
            className="flex items-center justify-center rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15"
          >
            Voir
          </Link>
        </div>
      )}
    </div>
  );
}

function MiniTrend({
  isUp,
}: {
  isUp: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-400">
        <Activity size={14} />
        Tendance
      </div>

      <div className="h-14">
        <svg viewBox="0 0 120 40" className="h-full w-full">
          <defs>
            <linearGradient
              id={isUp ? "upGradient" : "downGradient"}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={isUp ? "#34d399" : "#fb7185"}
                stopOpacity="0.35"
              />
              <stop
                offset="100%"
                stopColor={isUp ? "#34d399" : "#fb7185"}
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          <path
            d={
              isUp
                ? "M0 32 C15 28 25 26 40 20 C55 14 65 18 80 10 C95 5 105 8 120 2"
                : "M0 6 C15 10 25 14 40 18 C55 24 65 22 80 30 C95 34 105 32 120 38"
            }
            fill="none"
            stroke={isUp ? "#34d399" : "#fb7185"}
            strokeWidth="3"
            strokeLinecap="round"
          />

          <path
            d={
              isUp
                ? "M0 32 C15 28 25 26 40 20 C55 14 65 18 80 10 C95 5 105 8 120 2 L120 40 L0 40 Z"
                : "M0 6 C15 10 25 14 40 18 C55 24 65 22 80 30 C95 34 105 32 120 38 L120 40 L0 40 Z"
            }
            fill={`url(#${isUp ? "upGradient" : "downGradient"})`}
          />
        </svg>
      </div>
    </div>
  );
}