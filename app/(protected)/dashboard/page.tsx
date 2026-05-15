import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/get-current-user";
import { getFinnhubQuote } from "@/lib/finnhub";
import { prisma } from "@/lib/prisma";
import { convertCurrency, formatCurrency, Currency } from "@/lib/currency";

import { AutoRefresh } from "@/components/auto-refresh";
import { DashboardPerformanceChart } from "@/components/dashboard-performance-chart";
import { CreateSnapshotButton } from "@/components/create-snapshot-button";
import { PortfolioAllocationChart } from "@/components/portfolio-allocation-chart";
import { CheckLimitOrdersButton } from "@/components/check-limit-orders-button";

import { cancelOrderAction } from "@/app/(protected)/orders/actions";

import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  Clock3,
  Eye,
  LineChart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/connexion");
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  const displayCurrency = (
    dbUser?.preferredCurrency === "EUR" ? "EUR" : "USD"
  ) as Currency;

  const wallet = await prisma.wallet.findUnique({
    where: {
      userId: user.id,
    },
  });

  const positions = await prisma.position.findMany({
    where: {
      userId: user.id,
    },
    include: {
      asset: true,
    },
  });

  const sellTransactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      side: "SELL",
    },
  });

  const recentTransactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
    },
    include: {
      asset: true,
      order: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const snapshots = await prisma.portfolioSnapshot.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 30,
  });

  const realizedProfit = sellTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.realizedProfit ?? 0),
    0
  );

  const positionsWithMarket = await Promise.all(
    positions.map(async (position) => {
      const quote = await getFinnhubQuote(position.asset.ticker);

      const quantity = Number(position.quantity);
      const avgPrice = Number(position.avgPrice);
      const currentPrice = quote.c;

      const invested = quantity * avgPrice;
      const marketValue = quantity * currentPrice;
      const profitLoss = marketValue - invested;

      return {
        id: position.id,
        ticker: position.asset.ticker,
        quantity,
        avgPrice,
        currentPrice,
        invested,
        marketValue,
        profitLoss,
      };
    })
  );

  const watchlist = await prisma.watchlist.findMany({
    where: {
      userId: user.id,
    },
    include: {
      asset: true,
    },
    take: 5,
  });

  const watchlistWithQuotes = await Promise.all(
    watchlist.map(async (item) => {
      try {
        const quote = await getFinnhubQuote(item.asset.ticker);

        return {
          id: item.id,
          ticker: item.asset.ticker,
          price: quote.c,
          changePercent: quote.dp,
        };
      } catch {
        return {
          id: item.id,
          ticker: item.asset.ticker,
          price: 0,
          changePercent: 0,
        };
      }
    })
  );

  const sortedByProfit = [...positionsWithMarket].sort(
    (a, b) => b.profitLoss - a.profitLoss
  );

  const topWinner = sortedByProfit[0] ?? null;

  const topLoser =
    sortedByProfit.length > 1
      ? sortedByProfit[sortedByProfit.length - 1]
      : null;

  const cash = Number(wallet?.cashBalance ?? 0);

  const investedTotal = positionsWithMarket.reduce(
    (sum, item) => sum + item.invested,
    0
  );

  const portfolioValue = positionsWithMarket.reduce(
    (sum, item) => sum + item.marketValue,
    0
  );

  const totalAccountValue = cash + portfolioValue;

  const unrealizedProfit = positionsWithMarket.reduce(
    (sum, item) => sum + item.profitLoss,
    0
  );

  const totalProfit = realizedProfit + unrealizedProfit;

  const profitPercent =
    investedTotal > 0 ? (totalProfit / investedTotal) * 100 : 0;

  const performanceChartData = snapshots.map((snapshot) => ({
    date: new Date(snapshot.createdAt).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    }),
    value: Number(snapshot.totalValue),
  }));

  const allocationData = positionsWithMarket.map((position) => ({
    ticker: position.ticker,
    value: Number(position.marketValue.toFixed(2)),
  }));

  const openOrders = await prisma.order.findMany({
    where: {
      userId: user.id,
      orderType: "LIMIT",
      status: "PENDING",
    },
    include: {
      asset: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <AutoRefresh interval={30000} />

      <div className="pointer-events-none fixed left-1/2 top-0 h-130 w-130 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none fixed right-0 top-40 h-105 w-105 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* HEADER */}
        <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
              Dashboard InvestX
            </div>

            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              Bienvenue, {user.name ?? "Investisseur"}
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Suivez votre compte, vos positions, vos performances et vos ordres
              en temps réel.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/market"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Explorer le marché
            </Link>

            <Link
              href="/portfolio"
              className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-emerald-400/20 transition hover:bg-emerald-300"
            >
              Voir portfolio
            </Link>
          </div>
        </section>

        {/* HERO CARD */}
        <section className="mb-6 rounded-4xl border border-white/10 bg-white/6 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl lg:p-7">
          <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">
                Valeur totale du compte
              </p>

              <h2 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
                {formatCurrency(
                  convertCurrency(
                    Number(totalAccountValue ?? 0),
                    "USD",
                    displayCurrency
                  ),
                  displayCurrency
                )}
              </h2>

              <p
                className={`mt-3 text-sm font-bold ${
                  totalProfit >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {totalProfit >= 0 ? "+" : ""}
                {formatCurrency(
                  convertCurrency(
                    Number(totalProfit ?? 0),
                    "USD",
                    displayCurrency
                  ),
                  displayCurrency
                )}{" "}
                • {profitPercent.toFixed(2)}%
              </p>
            </div>

            <CreateSnapshotButton />
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
            {performanceChartData.length > 0 ? (
              <DashboardPerformanceChart
                data={performanceChartData}
                currency={displayCurrency}
              />
            ) : (
              <EmptyState
                title="Aucun snapshot pour le moment"
                description="Cliquez sur “Créer snapshot” pour enregistrer la valeur actuelle du compte."
              />
            )}
          </div>
        </section>

        {/* STATS */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard
            icon={<Wallet size={20} />}
            label="Cash disponible"
            value={formatCurrency(
              convertCurrency(Number(cash ?? 0), "USD", displayCurrency),
              displayCurrency
            )}
          />

          <StatCard
            icon={<BriefcaseBusiness size={20} />}
            label="Portefeuille"
            value={formatCurrency(
              convertCurrency(
                Number(portfolioValue ?? 0),
                "USD",
                displayCurrency
              ),
              displayCurrency
            )}
          />

          <StatCard
            icon={<CircleDollarSign size={20} />}
            label="Valeur totale"
            value={formatCurrency(
              convertCurrency(
                Number(totalAccountValue ?? 0),
                "USD",
                displayCurrency
              ),
              displayCurrency
            )}
          />

          <StatCard
            icon={<TrendingUp size={20} />}
            label="Profit réalisé"
            value={formatCurrency(
              convertCurrency(
                Number(realizedProfit ?? 0),
                "USD",
                displayCurrency
              ),
              displayCurrency
            )}
            positive={realizedProfit >= 0}
          />

          <StatCard
            icon={<LineChart size={20} />}
            label="Profit non réalisé"
            value={formatCurrency(
              convertCurrency(
                Number(unrealizedProfit ?? 0),
                "USD",
                displayCurrency
              ),
              displayCurrency
            )}
            positive={unrealizedProfit >= 0}
          />

          <StatCard
            icon={<BarChart3 size={20} />}
            label="Profit total"
            value={formatCurrency(
              convertCurrency(
                Number(totalProfit ?? 0),
                "USD",
                displayCurrency
              ),
              displayCurrency
            )}
            subValue={`${profitPercent.toFixed(2)}%`}
            positive={totalProfit >= 0}
          />
        </section>

        {/* WINNER / LOSER */}
        <section className="mb-6 grid gap-4 lg:grid-cols-2">
          <MarketCard
            type="winner"
            title="Top gagnant"
            item={topWinner}
            currency={displayCurrency}
          />

          <MarketCard
            type="loser"
            title="Top perdant"
            item={topLoser}
            currency={displayCurrency}
          />
        </section>

        {/* CHART + WATCHLIST */}
        <section className="mb-6 grid gap-4 lg:grid-cols-5">
          <div className="rounded-4xl border border-white/10 bg-white/6 p-5 backdrop-blur-xl lg:col-span-3">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">Allocation portefeuille</h2>
                <p className="text-sm text-slate-400">
                  Répartition de vos positions actuelles.
                </p>
              </div>

              <Link
                href="/portfolio"
                className="hidden items-center gap-2 text-sm font-bold text-emerald-300 sm:flex"
              >
                Détails <ArrowRight size={16} />
              </Link>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              {allocationData.length > 0 ? (
                <PortfolioAllocationChart
                  data={allocationData}
                  currency={displayCurrency}
                />
              ) : (
                <EmptyState
                  title="Aucune allocation"
                  description="Votre allocation apparaîtra lorsque vous aurez des positions."
                />
              )}
            </div>
          </div>

          <div className="rounded-4xl border border-white/10 bg-white/6 p-5 backdrop-blur-xl lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">Watchlist Live</h2>
                <p className="text-sm text-slate-400">Prix suivis en direct.</p>
              </div>

              <Link
                href="/watchlist"
                className="text-sm font-bold text-emerald-300"
              >
                Voir tout
              </Link>
            </div>

            {watchlistWithQuotes.length === 0 ? (
              <EmptyState
                title="Aucune action"
                description="Ajoutez des actions à votre watchlist depuis le marché."
              />
            ) : (
              <div className="space-y-3">
                {watchlistWithQuotes.map((item) => (
                  <Link
                    key={item.id}
                    href={`/market/${item.ticker}`}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-4 transition hover:border-emerald-400/30 hover:bg-white/8"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                        <Eye size={18} />
                      </div>

                      <div>
                        <p className="font-black">{item.ticker}</p>
                        <p className="text-xs text-slate-500">Market price</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold">
                        {formatCurrency(
                          convertCurrency(
                            Number(item.price ?? 0),
                            "USD",
                            displayCurrency
                          ),
                          displayCurrency
                        )}
                      </p>

                      <p
                        className={`text-sm font-bold ${
                          item.changePercent >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {item.changePercent >= 0 ? "+" : ""}
                        {item.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* POSITIONS */}
        <section className="mb-6 rounded-4xl border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
          <SectionHeader
            title="Positions récentes"
            description="Suivi des quantités, prix moyens, prix actuels et P/L."
            href="/portfolio"
          />

          {positionsWithMarket.length === 0 ? (
            <EmptyState
              title="Aucune position"
              description="Vos positions apparaîtront ici après vos premiers achats."
            />
          ) : (
            <ResponsiveTable>
              <thead className="bg-white/4 text-xs uppercase text-slate-400">
                <tr>
                  <th className="p-4">Ticker</th>
                  <th className="p-4">Quantité</th>
                  <th className="p-4">Prix moyen</th>
                  <th className="p-4">Prix actuel</th>
                  <th className="p-4">Valeur</th>
                  <th className="p-4">P/L</th>
                </tr>
              </thead>

              <tbody>
                {positionsWithMarket.map((position) => (
                  <tr
                    key={position.id}
                    className="border-t border-white/10 transition hover:bg-white/4"
                  >
                    <td className="p-4 font-black">{position.ticker}</td>
                    <td className="p-4 text-slate-300">{position.quantity}</td>
                    <td className="p-4 text-slate-300">
                      {formatCurrency(
                        convertCurrency(
                          Number(position.avgPrice ?? 0),
                          "USD",
                          displayCurrency
                        ),
                        displayCurrency
                      )}
                    </td>
                    <td className="p-4 text-slate-300">
                      {formatCurrency(
                        convertCurrency(
                          Number(position.currentPrice ?? 0),
                          "USD",
                          displayCurrency
                        ),
                        displayCurrency
                      )}
                    </td>
                    <td className="p-4 font-semibold">
                      {formatCurrency(
                        convertCurrency(
                          Number(position.marketValue ?? 0),
                          "USD",
                          displayCurrency
                        ),
                        displayCurrency
                      )}
                    </td>
                    <td
                      className={`p-4 font-black ${
                        position.profitLoss >= 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {formatCurrency(
                        convertCurrency(
                          Number(position.profitLoss ?? 0),
                          "USD",
                          displayCurrency
                        ),
                        displayCurrency
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </ResponsiveTable>
          )}
        </section>

        {/* TRANSACTIONS */}
        <section className="mb-6 rounded-4xl border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
          <SectionHeader
            title="Dernières transactions"
            description="Historique rapide de vos derniers achats et ventes."
            href="/orders"
          />

          {recentTransactions.length === 0 ? (
            <EmptyState
              title="Aucune transaction"
              description="Vos transactions apparaîtront ici."
            />
          ) : (
            <ResponsiveTable>
              <thead className="bg-white/4 text-xs uppercase text-slate-400">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Ticker</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Quantité</th>
                  <th className="p-4">Prix</th>
                  <th className="p-4">Total</th>
                </tr>
              </thead>

              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-t border-white/10 transition hover:bg-white/4"
                  >
                    <td className="p-4 text-slate-300">
                      {new Date(transaction.createdAt).toLocaleString("fr-FR")}
                    </td>

                    <td className="p-4 font-black">
                      {transaction.asset.ticker}
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

                    <td className="p-4 text-slate-300">
                      {Number(transaction.quantity)}
                    </td>

                    <td className="p-4 text-slate-300">
                      {formatCurrency(
                        convertCurrency(
                          Number(transaction.unitPrice ?? 0),
                          "USD",
                          displayCurrency
                        ),
                        displayCurrency
                      )}
                    </td>

                    <td className="p-4 font-semibold">
                      {formatCurrency(
                        convertCurrency(
                          Number(transaction.totalAmount ?? 0),
                          "USD",
                          displayCurrency
                        ),
                        displayCurrency
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </ResponsiveTable>
          )}
        </section>

        {/* ORDERS */}
        <section className="rounded-4xl border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black">Open Orders</h2>
              <p className="text-sm text-slate-400">
                Ordres limites en attente d’exécution.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <CheckLimitOrdersButton />

              <Link
                href="/orders"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-emerald-300 transition hover:bg-white/10"
              >
                Voir tout
              </Link>
            </div>
          </div>

          {openOrders.length === 0 ? (
            <EmptyState
              title="Aucun ordre limite"
              description="Les ordres en attente apparaîtront ici."
            />
          ) : (
            <div className="space-y-3">
              {openOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-black">
                      {order.side} LIMIT {order.asset.ticker}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Quantité : {Number(order.quantity)} • Prix limite :{" "}
                      {formatCurrency(
                        convertCurrency(
                          Number(order.limitPrice ?? 0),
                          "USD",
                          displayCurrency
                        ),
                        displayCurrency
                      )}
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <Clock3 size={13} />
                      Créé le{" "}
                      {new Date(order.createdAt).toLocaleString("fr-FR")}
                    </p>
                  </div>

                  <form action={cancelOrderAction}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <button className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-bold text-red-300 transition hover:bg-red-400/20">
                      Annuler
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  subValue,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-4xl border border-white/10 bg-white/6 p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/10">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
        {icon}
      </div>

      <p className="text-sm text-slate-400">{label}</p>

      <h3
        className={`mt-2 text-xl font-black ${
          positive === undefined
            ? "text-white"
            : positive
              ? "text-emerald-400"
              : "text-red-400"
        }`}
      >
        {value}
      </h3>

      {subValue && (
        <p
          className={`mt-1 text-sm font-bold ${
            positive ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {subValue}
        </p>
      )}
    </div>
  );
}

function MarketCard({
  type,
  title,
  item,
  currency,
}: {
  type: "winner" | "loser";
  title: string;
  item: {
    ticker: string;
    quantity: number;
    profitLoss: number;
  } | null;
  currency: Currency;
}) {
  const isWinner = type === "winner";

  return (
    <div className="rounded-4xl border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            isWinner
              ? "bg-emerald-400/10 text-emerald-300"
              : "bg-red-400/10 text-red-300"
          }`}
        >
          {isWinner ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
        </div>

        <div>
          <h2 className="text-xl font-black">{title}</h2>
          <p className="text-sm text-slate-400">Performance actuelle</p>
        </div>
      </div>

      {item ? (
        <div>
          <h3 className="text-3xl font-black">{item.ticker}</h3>

          <p className="mt-1 text-sm text-slate-400">
            {item.quantity} action(s)
          </p>

          <p
            className={`mt-4 text-2xl font-black ${
              item.profitLoss >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {formatCurrency(
              convertCurrency(Number(item.profitLoss ?? 0), "USD", currency),
              currency
            )}
          </p>
        </div>
      ) : (
        <EmptyState
          title="Aucune position"
          description="Achetez une action pour voir cette statistique."
        />
      )}
    </div>
  );
}

function SectionHeader({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href?: string;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-black">{title}</h2>
        <p className="text-sm text-slate-400">{description}</p>
      </div>

      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-2 text-sm font-bold text-emerald-300"
        >
          Voir tout <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

function ResponsiveTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <div className="overflow-x-auto">
        <table className="w-full min-w-190 text-left text-sm">
          {children}
        </table>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 p-6 text-center">
      <p className="font-bold text-white">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
    </div>
  );
}