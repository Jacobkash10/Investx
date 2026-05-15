import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { RealizedProfitChart } from "@/components/realized-profit-chart";
import { ProfitByTickerChart } from "@/components/profit-by-ticker-chart";
import { MonthlyProfitChart } from "@/components/monthly-profit-chart";

import {
  Currency,
  convertCurrency,
  formatCurrency,
} from "@/lib/currency";

export default async function AnalyticsPage() {
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

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      asset: true,
      order: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalTrades = transactions.length;

  const buyTrades = transactions.filter((tx) => tx.side === "BUY");
  const sellTrades = transactions.filter((tx) => tx.side === "SELL");

  const realizedSellTrades = sellTrades.map((tx) => ({
    ...tx,
    realizedProfitNumber: convertCurrency(
      Number(tx.realizedProfit ?? 0),
      "USD",
      displayCurrency
    ),
  }));

  const realizedProfit = realizedSellTrades.reduce(
    (sum, tx) => sum + tx.realizedProfitNumber,
    0
  );

  const winningTrades = realizedSellTrades.filter(
    (tx) => tx.realizedProfitNumber > 0
  );

  const losingTrades = realizedSellTrades.filter(
    (tx) => tx.realizedProfitNumber < 0
  );

  const winRate =
    realizedSellTrades.length > 0
      ? (winningTrades.length / realizedSellTrades.length) * 100
      : 0;

  const averageProfit =
    realizedSellTrades.length > 0
      ? realizedProfit / realizedSellTrades.length
      : 0;

  const bestTrade =
    realizedSellTrades.length > 0
      ? [...realizedSellTrades].sort(
          (a, b) => b.realizedProfitNumber - a.realizedProfitNumber
        )[0]
      : null;

  const worstTrade =
    realizedSellTrades.length > 0
      ? [...realizedSellTrades].sort(
          (a, b) => a.realizedProfitNumber - b.realizedProfitNumber
        )[0]
      : null;

  const realizedProfitChartData = realizedSellTrades
    .slice()
    .reverse()
    .map((tx) => ({
      label: `${tx.asset.ticker} ${new Date(
        tx.createdAt
      ).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      })}`,

      profit: tx.realizedProfitNumber,
    }));

  const profitByTickerMap = new Map<string, number>();

  for (const tx of realizedSellTrades) {
    const ticker = tx.asset.ticker;

    const current = profitByTickerMap.get(ticker) ?? 0;

    profitByTickerMap.set(
      ticker,
      current + tx.realizedProfitNumber
    );
  }

  const profitByTickerData = Array.from(
    profitByTickerMap.entries()
  )
    .map(([ticker, profit]) => ({
      ticker,
      profit,
    }))
    .sort((a, b) => b.profit - a.profit);

  const monthlyProfitMap = new Map<string, number>();

  for (const tx of realizedSellTrades) {
    const month = new Date(tx.createdAt).toLocaleDateString(
      "fr-FR",
      {
        month: "short",
        year: "numeric",
      }
    );

    const current = monthlyProfitMap.get(month) ?? 0;

    monthlyProfitMap.set(
      month,
      current + tx.realizedProfitNumber
    );
  }

  const monthlyProfitData = Array.from(
    monthlyProfitMap.entries()
  ).map(([month, profit]) => ({
    month,
    profit,
  }));

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none fixed left-1/2 top-0 h-125 w-125 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="pointer-events-none fixed right-0 top-40 h-100 w-100 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section>
          <div className="mb-4 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
            Analytics • Trading Performance
          </div>

          <h1 className="text-4xl font-black md:text-5xl">
            Analytics
          </h1>

          <p className="mt-3 text-slate-400">
            Analyse avancée de vos performances de trading.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat
            label="Total trades"
            value={String(totalTrades)}
          />

          <Stat
            label="BUY"
            value={String(buyTrades.length)}
            positive
          />

          <Stat
            label="SELL"
            value={String(sellTrades.length)}
            positive={false}
          />

          <Stat
            label="Win rate"
            value={`${winRate.toFixed(2)}%`}
          />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Stat
            label="Profit réalisé total"
            value={formatCurrency(
              realizedProfit,
              displayCurrency
            )}
            positive={realizedProfit >= 0}
          />

          <Stat
            label="Profit moyen par vente"
            value={formatCurrency(
              averageProfit,
              displayCurrency
            )}
            positive={averageProfit >= 0}
          />

          <Stat
            label="Trades gagnants / perdants"
            value={`${winningTrades.length} / ${losingTrades.length}`}
          />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card title="Meilleur trade">
            {bestTrade ? (
              <>
                <h2 className="text-3xl font-black">
                  {bestTrade.asset.ticker}
                </h2>

                <p className="mt-1 text-slate-400">
                  {Number(bestTrade.quantity)} action(s)
                  vendue(s)
                </p>

                <p className="mt-4 text-2xl font-black text-emerald-400">
                  +
                  {formatCurrency(
                    bestTrade.realizedProfitNumber,
                    displayCurrency
                  )}
                </p>
              </>
            ) : (
              <Empty text="Aucun trade vendu." />
            )}
          </Card>

          <Card title="Pire trade">
            {worstTrade ? (
              <>
                <h2 className="text-3xl font-black">
                  {worstTrade.asset.ticker}
                </h2>

                <p className="mt-1 text-slate-400">
                  {Number(worstTrade.quantity)} action(s)
                  vendue(s)
                </p>

                <p
                  className={`mt-4 text-2xl font-black ${
                    worstTrade.realizedProfitNumber >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {formatCurrency(
                    worstTrade.realizedProfitNumber,
                    displayCurrency
                  )}
                </p>
              </>
            ) : (
              <Empty text="Aucun trade vendu." />
            )}
          </Card>
        </section>
                <Card title="Profit réalisé par transaction">
          {realizedProfitChartData.length > 0 ? (
            <RealizedProfitChart
              data={realizedProfitChartData}
              currency={displayCurrency}
            />
          ) : (
            <Empty text="Aucune vente pour afficher un graphique." />
          )}
        </Card>

        <Card title="Profit réalisé par ticker">
          {profitByTickerData.length > 0 ? (
            <ProfitByTickerChart
              data={profitByTickerData}
              currency={displayCurrency}
            />
          ) : (
            <Empty text="Aucune vente pour calculer le profit par ticker." />
          )}
        </Card>

        <Card title="Profit réalisé par mois">
          {monthlyProfitData.length > 0 ? (
            <MonthlyProfitChart
              data={monthlyProfitData}
              currency={displayCurrency}
            />
          ) : (
            <Empty text="Aucune vente pour calculer le profit mensuel." />
          )}
        </Card>

        <Card title="Historique des transactions">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-225 text-left">
                <thead className="bg-white/6 text-sm text-slate-400">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Ticker</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Quantité</th>
                    <th className="p-4">Prix</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Profit réalisé</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td className="p-5 text-slate-400" colSpan={7}>
                        Aucune transaction.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => {
                      const realized = convertCurrency(
                        Number(tx.realizedProfit ?? 0),
                        "USD",
                        displayCurrency
                      );

                      return (
                        <tr
                          key={tx.id}
                          className="border-t border-white/10 transition hover:bg-white/4"
                        >
                          <td className="p-4 text-sm text-slate-300">
                            {new Date(tx.createdAt).toLocaleString("fr-FR")}
                          </td>

                          <td className="p-4 font-black text-white">
                            {tx.asset.ticker}
                          </td>

                          <td
                            className={`p-4 font-black ${
                              tx.side === "BUY"
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {tx.side}
                          </td>

                          <td className="p-4 font-semibold">
                            {Number(tx.quantity)}
                          </td>

                          <td className="p-4">
                            {formatCurrency(
                              convertCurrency(
                                Number(tx.unitPrice),
                                "USD",
                                displayCurrency
                              ),
                              displayCurrency
                            )}
                          </td>

                          <td className="p-4 font-semibold">
                            {formatCurrency(
                              convertCurrency(
                                Number(tx.totalAmount),
                                "USD",
                                displayCurrency
                              ),
                              displayCurrency
                            )}
                          </td>

                          <td
                            className={`p-4 font-black ${
                              realized >= 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {tx.side === "SELL"
                              ? formatCurrency(realized, displayCurrency)
                              : "-"}
                          </td>
                        </tr>
                      );
                    })
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

function Stat({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
      <p className="text-sm text-slate-400">{label}</p>

      <p
        className={`mt-2 text-2xl font-black ${
          positive === undefined
            ? "text-white"
            : positive
              ? "text-emerald-400"
              : "text-red-400"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 p-6 text-center text-slate-400">
      {text}
    </div>
  );
}