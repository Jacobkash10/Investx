import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFinnhubQuote } from "@/lib/finnhub";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PortfolioSellButton } from "@/components/portfolio-sell-button";
import { PortfolioAllocationChart } from "@/components/portfolio-allocation-chart";
import { AutoRefresh } from "@/components/auto-refresh";
import { PortfolioFilter } from "@/components/portfolio-filter";
import { Pagination } from "@/components/pagination";
import { ExportPortfolioCsv } from "@/components/export-portfolio-csv";
import {
  Currency,
  convertCurrency,
  formatCurrency,
} from "@/lib/currency";

type PortfolioPageProps = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function PortfolioPage({
  searchParams,
}: PortfolioPageProps) {
  const params = await searchParams;

  const q = params.q?.trim().toUpperCase();
  const sort = params.sort ?? "value-desc";
  const page = Math.max(Number(params.page ?? 1), 1);
  const limit = 10;
  const start = (page - 1) * limit;
  const end = start + limit;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/connexion");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { preferredCurrency: true },
  });

  const displayCurrency = (
    dbUser?.preferredCurrency === "EUR" ? "EUR" : "USD"
  ) as Currency;

  const positions = await prisma.position.findMany({
    where: { userId: session.user.id },
    include: { asset: true },
    orderBy: { createdAt: "desc" },
  });

  const positionsWithMarket = await Promise.all(
    positions.map(async (position) => {
      const quote = await getFinnhubQuote(position.asset.ticker);

      const quantity = Number(position.quantity);
      const avgPrice = Number(position.avgPrice);
      const currentPrice = quote.c;

      const invested = quantity * avgPrice;
      const marketValue = quantity * currentPrice;
      const profitLoss = marketValue - invested;
      const profitLossPercent =
        invested > 0 ? (profitLoss / invested) * 100 : 0;

      return {
        id: position.id,
        ticker: position.asset.ticker,
        name: position.asset.name,
        quantity,
        avgPrice,
        currentPrice,
        invested,
        marketValue,
        profitLoss,
        profitLossPercent,
      };
    })
  );

  const filteredPositions = positionsWithMarket.filter((position) => {
    if (!q) return true;

    return (
      position.ticker.toUpperCase().includes(q) ||
      position.name.toUpperCase().includes(q)
    );
  });

  const sortedFilteredPositions = [...filteredPositions].sort((a, b) => {
    switch (sort) {
      case "value-asc":
        return a.marketValue - b.marketValue;
      case "profit-desc":
        return b.profitLoss - a.profitLoss;
      case "profit-asc":
        return a.profitLoss - b.profitLoss;
      case "ticker-asc":
        return a.ticker.localeCompare(b.ticker);
      case "ticker-desc":
        return b.ticker.localeCompare(a.ticker);
      case "value-desc":
      default:
        return b.marketValue - a.marketValue;
    }
  });

  const totalPages = Math.ceil(sortedFilteredPositions.length / limit);
  const paginatedPositions = sortedFilteredPositions.slice(start, end);

  const totalInvested = positionsWithMarket.reduce(
    (sum, item) => sum + item.invested,
    0
  );

  const totalMarketValue = positionsWithMarket.reduce(
    (sum, item) => sum + item.marketValue,
    0
  );

  const totalProfitLoss = totalMarketValue - totalInvested;
  const totalProfitLossPercent =
    totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  const allocationData = positionsWithMarket.map((position) => ({
    ticker: position.ticker,
    value: Number(
      convertCurrency(position.marketValue, "USD", displayCurrency).toFixed(2)
    ),
  }));

  const sortedPositions = [...positionsWithMarket].sort(
    (a, b) => b.marketValue - a.marketValue
  );

  const money = (value: number) =>
    formatCurrency(
      convertCurrency(Number(value ?? 0), "USD", displayCurrency),
      displayCurrency
    );

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <AutoRefresh interval={30000} />

      <div className="pointer-events-none fixed left-1/2 top-0 h-125 w-125 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none fixed right-0 top-40 h-100 w-100 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
              Portfolio • Live Market
            </div>

            <h1 className="text-4xl font-black md:text-5xl">
              Mon Portfolio
            </h1>

            <p className="mt-3 text-slate-400">
              Vue complète de vos positions, allocations et performances.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <PortfolioFilter />
            <ExportPortfolioCsv rows={sortedFilteredPositions} />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Montant investi" value={money(totalInvested)} />
          <Stat label="Valeur actuelle" value={money(totalMarketValue)} />
          <Stat
            label="Profit / Perte"
            value={money(totalProfitLoss)}
            subValue={`${totalProfitLossPercent.toFixed(2)}%`}
            positive={totalProfitLoss >= 0}
          />
          <Stat
            label="Nombre de positions"
            value={String(positionsWithMarket.length)}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <Card title="Allocation portefeuille">
            {allocationData.length > 0 ? (
              <PortfolioAllocationChart
                data={allocationData}
                currency={displayCurrency}
              />
            ) : (
              <Empty text="Aucune allocation pour le moment." />
            )}
          </Card>

          <Card title="Répartition par valeur" className="xl:col-span-2">
            {sortedPositions.length === 0 ? (
              <Empty text="Aucune position pour le moment." />
            ) : (
              <div className="space-y-5">
                {sortedPositions.map((position) => {
                  const allocationPercent =
                    totalMarketValue > 0
                      ? (position.marketValue / totalMarketValue) * 100
                      : 0;

                  return (
                    <div
                      key={position.id}
                      className="rounded-4xl border border-white/10 bg-white/6 p-4"
                    >
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <div>
                          <p className="font-black">{position.ticker}</p>
                          <p className="text-sm text-slate-400">
                            {position.name}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-black">
                            {allocationPercent.toFixed(2)}%
                          </p>
                          <p className="text-xs text-slate-400">
                            {position.quantity} action(s)
                          </p>
                        </div>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-emerald-400"
                          style={{ width: `${allocationPercent}%` }}
                        />
                      </div>

                      <p className="mt-2 text-sm font-bold text-slate-200">
                        {money(position.marketValue)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </section>

        <Card title="Mes positions">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-225 text-left">
                <thead className="bg-white/6 text-sm text-slate-400">
                  <tr>
                    <th className="p-4">Action</th>
                    <th className="p-4">Quantité</th>
                    <th className="p-4">Prix moyen</th>
                    <th className="p-4">Prix actuel</th>
                    <th className="p-4">Investi</th>
                    <th className="p-4">Valeur</th>
                    <th className="p-4">P/L</th>
                    <th className="p-4">Trader</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedFilteredPositions.length === 0 ? (
                    <tr>
                      <td className="p-5 text-slate-400" colSpan={8}>
                        Aucune position trouvée.
                      </td>
                    </tr>
                  ) : (
                    paginatedPositions.map((position) => (
                      <tr
                        key={position.id}
                        className="border-t border-white/10 transition hover:bg-white/4"
                      >
                        <td className="p-4">
                          <Link
                            href={`/portfolio/${position.ticker}`}
                            className="font-black text-white hover:text-emerald-300"
                          >
                            {position.ticker}
                          </Link>
                          <p className="text-sm text-slate-400">
                            {position.name}
                          </p>
                        </td>

                        <td className="p-4 font-bold">{position.quantity}</td>
                        <td className="p-4">{money(position.avgPrice)}</td>
                        <td className="p-4">{money(position.currentPrice)}</td>
                        <td className="p-4">{money(position.invested)}</td>
                        <td className="p-4 font-bold">
                          {money(position.marketValue)}
                        </td>

                        <td
                          className={`p-4 font-black ${
                            position.profitLoss >= 0
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {money(position.profitLoss)}
                          <p className="text-xs">
                            {position.profitLossPercent.toFixed(2)}%
                          </p>
                        </td>

                        <td className="p-4">
                          <PortfolioSellButton
                            ticker={position.ticker}
                            maxQuantity={position.quantity}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <Pagination
          page={page}
          totalPages={totalPages}
          basePath="/portfolio"
          searchParams={{
            q,
            sort,
          }}
        />
      </div>
    </main>
  );
}

function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-4xl border border-white/10 bg-white/6 p-5 backdrop-blur-xl ${className}`}
    >
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

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 p-6 text-center text-slate-400">
      {text}
    </div>
  );
}