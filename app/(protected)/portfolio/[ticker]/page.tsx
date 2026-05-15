import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFinnhubQuote } from "@/lib/finnhub";
import { getYahooHistoricalPrices } from "@/lib/yahoo";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PriceChart } from "@/components/price-chart";
import { PortfolioSellButton } from "@/components/portfolio-sell-button";
import {
  Currency,
  convertCurrency,
  formatCurrency,
} from "@/lib/currency";

type PositionDetailPageProps = {
  params: Promise<{
    ticker: string;
  }>;
};

export default async function PositionDetailPage({
  params,
}: PositionDetailPageProps) {
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

  const { ticker } = await params;
  const symbol = ticker.toUpperCase();

  const asset = await prisma.asset.findUnique({
    where: {
      ticker: symbol,
    },
  });

  if (!asset) {
    redirect("/portfolio");
  }

  const position = await prisma.position.findUnique({
    where: {
      userId_assetId: {
        userId: session.user.id,
        assetId: asset.id,
      },
    },
  });

  if (!position) {
    redirect("/portfolio");
  }

  const quote = await getFinnhubQuote(symbol);
  const chartData = await getYahooHistoricalPrices(symbol, "3M");

  const quantity = Number(position.quantity);
  const avgPrice = Number(position.avgPrice);
  const currentPrice = quote.c;

  const invested = quantity * avgPrice;
  const marketValue = quantity * currentPrice;
  const profitLoss = marketValue - invested;
  const profitLossPercent =
    invested > 0 ? (profitLoss / invested) * 100 : 0;

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      assetId: asset.id,
    },
    include: {
      order: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

    return (
      <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
        <div className="pointer-events-none fixed left-1/2 top-0 h-125 w-125 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none fixed right-0 top-40 h-100 w-100 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <section className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Link
                href="/portfolio"
                className="inline-flex items-center rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/8"
              >
                ← Retour Portfolio
              </Link>

              <div className="mt-5 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
                {symbol} • Position détaillée
              </div>

              <h1 className="mt-4 text-4xl font-black md:text-5xl">
                {asset.name}
              </h1>

              <p className="mt-2 text-slate-400">
                Analyse complète de votre position.
              </p>
            </div>

            <PortfolioSellButton
              ticker={symbol}
              maxQuantity={quantity}
            />
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Stat
              label="Quantité"
              value={quantity.toString()}
            />

            <Stat
              label="Prix moyen"
              value={formatCurrency(
                convertCurrency(avgPrice, "USD", displayCurrency),
                displayCurrency
              )}
            />

            <Stat
              label="Prix actuel"
              value={formatCurrency(
                convertCurrency(currentPrice, "USD", displayCurrency),
                displayCurrency
              )}
            />

            <Stat
              label="P/L non réalisé"
              value={formatCurrency(
                convertCurrency(
                  profitLoss,
                  "USD",
                  displayCurrency
                ),
                displayCurrency
              )}
              subValue={`${profitLossPercent.toFixed(2)}%`}
              positive={profitLoss >= 0}
            />
          </section>

          <Card title="Graphique réel • 3 mois">
            {chartData.length > 0 ? (
              <PriceChart
                data={chartData}
                currency={displayCurrency}
              />
            ) : (
              <Empty text="Pas de données disponibles." />
            )}
          </Card>

          <Card title="Résumé de la position">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MiniStat
                label="Montant investi"
                value={formatCurrency(
                  convertCurrency(
                    invested,
                    "USD",
                    displayCurrency
                  ),
                  displayCurrency
                )}
              />

              <MiniStat
                label="Valeur actuelle"
                value={formatCurrency(
                  convertCurrency(
                    marketValue,
                    "USD",
                    displayCurrency
                  ),
                  displayCurrency
                )}
              />

              <MiniStat
                label="Exchange"
                value={asset.exchange ?? "US"}
              />

              <MiniStat
                label="Devise"
                value={displayCurrency}
              />
            </div>
          </Card>

          <Card title={`Dernières transactions • ${symbol}`}>
            {transactions.length === 0 ? (
              <Empty text="Aucune transaction." />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-225 text-left">
                    <thead className="bg-white/6 text-sm text-slate-400">
                      <tr>
                        <th className="p-4">Date</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Quantité</th>
                        <th className="p-4">Prix</th>
                        <th className="p-4">Total</th>
                        <th className="p-4">Profit réalisé</th>
                        <th className="p-4">Statut</th>
                      </tr>
                    </thead>

                    <tbody>
                      {transactions.map((transaction) => {
                        const realizedProfit = Number(
                          transaction.realizedProfit ?? 0
                        );

                        return (
                          <tr
                            key={transaction.id}
                            className="border-t border-white/10 transition hover:bg-white/4"
                          >
                            <td className="p-4 text-sm text-slate-300">
                              {new Date(
                                transaction.createdAt
                              ).toLocaleString("fr-FR")}
                            </td>

                            <td
                              className={`p-4 font-black ${
                                transaction.side === "BUY"
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }`}
                            >
                              {transaction.side}
                            </td>

                            <td className="p-4 font-bold">
                              {Number(transaction.quantity)}
                            </td>

                            <td className="p-4">
                              {formatCurrency(
                                convertCurrency(
                                  Number(transaction.unitPrice),
                                  "USD",
                                  displayCurrency
                                ),
                                displayCurrency
                              )}
                            </td>

                            <td className="p-4 font-semibold">
                              {formatCurrency(
                                convertCurrency(
                                  Number(transaction.totalAmount),
                                  "USD",
                                  displayCurrency
                                ),
                                displayCurrency
                              )}
                            </td>

                            <td
                              className={`p-4 font-black ${
                                realizedProfit >= 0
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }`}
                            >
                              {transaction.side === "SELL"
                                ? formatCurrency(
                                    convertCurrency(
                                      realizedProfit,
                                      "USD",
                                      displayCurrency
                                    ),
                                    displayCurrency
                                  )
                                : "-"}
                            </td>

                            <td className="p-4">
                              <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs font-bold text-slate-300">
                                {transaction.order.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
  subValue,
  positive,
}: {
  label: string;
  value: string;
  subValue?: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-4xl border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
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

      {subValue && (
        <p
          className={`mt-1 text-sm font-bold ${
            positive
              ? "text-emerald-400"
              : "text-red-400"
          }`}
        >
          {subValue}
        </p>
      )}
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-4xl border border-white/10 bg-white/6 p-4">
      <p className="text-sm text-slate-400">{label}</p>

      <p className="mt-1 font-black text-white">
        {value}
      </p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-4xl border border-dashed border-white/10 bg-white/6 p-6 text-center text-slate-400">
      {text}
    </div>
  );
}