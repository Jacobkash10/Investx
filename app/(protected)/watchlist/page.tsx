import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFinnhubQuote } from "@/lib/finnhub";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  addToWatchlistAction,
  removeFromWatchlistAction,
} from "./actions";
import { AutoRefresh } from "@/components/auto-refresh";

import {
  Currency,
  convertCurrency,
  formatCurrency,
} from "@/lib/currency";

export default async function WatchlistPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/connexion");
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      preferredCurrency: true,
    },
  });

  const displayCurrency = (
    dbUser?.preferredCurrency === "EUR" ? "EUR" : "USD"
  ) as Currency;

  const watchlist = await prisma.watchlist.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      asset: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const watchlistWithPrices = await Promise.all(
    watchlist.map(async (item) => {
      const quote = await getFinnhubQuote(item.asset.ticker);

      return {
        id: item.id,
        ticker: item.asset.ticker,
        name: item.asset.name,
        currentPrice: convertCurrency(
          Number(quote.c),
          "USD",
          displayCurrency
        ),
        changePercent: Number(quote.dp ?? 0),
      };
    })
  );

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <AutoRefresh interval={30000} />

      <div className="pointer-events-none fixed left-1/2 top-0 h-125 w-125 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none fixed right-0 top-40 h-100 w-100 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section>
          <div className="mb-4 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
            Watchlist • Live Tracking
          </div>

          <h1 className="text-4xl font-black md:text-5xl">
            Watchlist
          </h1>

          <p className="mt-3 text-slate-400">
            Surveillez des actions sans les acheter.
          </p>
        </section>

        <Card title="Ajouter une action">
          <form
            action={addToWatchlistAction}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              name="ticker"
              placeholder="Ticker ex: AAPL"
              className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-bold text-white outline-none backdrop-blur-xl placeholder:text-slate-500 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 sm:max-w-xs"
            />

            <button className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-sm font-bold text-emerald-300 transition hover:bg-emerald-400/20 hover:text-emerald-200">
              Ajouter
            </button>
          </form>
        </Card>

        <Card title="Mes actions surveillées">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-175 text-left">
                <thead className="bg-white/6 text-sm text-slate-400">
                  <tr>
                    <th className="p-4">Ticker</th>
                    <th className="p-4">Prix actuel</th>
                    <th className="p-4">Variation</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {watchlistWithPrices.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-5 text-slate-400">
                        Aucune action dans la watchlist.
                      </td>
                    </tr>
                  ) : (
                    watchlistWithPrices.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-white/10 transition hover:bg-white/4"
                      >
                        <td className="p-4">
                          <p className="font-black text-white">
                            {item.ticker}
                          </p>
                          <p className="text-sm text-slate-400">
                            {item.name}
                          </p>
                        </td>

                        <td className="p-4 font-semibold">
                          {formatCurrency(
                            item.currentPrice,
                            displayCurrency
                          )}
                        </td>

                        <td
                          className={`p-4 font-black ${
                            item.changePercent >= 0
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {item.changePercent.toFixed(2)}%
                        </td>

                        <td className="p-4">
                          <form action={removeFromWatchlistAction}>
                            <input
                              type="hidden"
                              name="watchlistId"
                              value={item.id}
                            />

                            <button className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/20 hover:text-red-200">
                              Supprimer
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-4xl border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
      <h2 className="mb-5 text-xl font-black">{title}</h2>
      {children}
    </section>
  );
}