import { TradeForm } from "@/components/trade-form";
import { PriceChart } from "@/components/price-chart";
import { CandlestickChart } from "@/components/candlestick-chart";
import { AddToWatchlistButton } from "@/components/add-to-watchlist-button";
import { ChartRangeTabs } from "@/components/chart-range-tabs";
import { QuickPriceAlertForm } from "@/components/quick-price-alert-form";
import { AutoRefresh } from "@/components/auto-refresh";

import { getFinnhubQuote } from "@/lib/finnhub";
import { getYahooHistoricalPrices } from "@/lib/yahoo";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-current-user";

import { Currency, convertCurrency, formatCurrency } from "@/lib/currency";

type MarketAssetPageProps = {
  params: Promise<{ ticker: string }>;
  searchParams: Promise<{ range?: string }>;
};

export default async function MarketAssetPage({
  params,
  searchParams,
}: MarketAssetPageProps) {
  const { ticker } = await params;
  const query = await searchParams;

  const symbol = ticker.toUpperCase();
  const range = query.range === "1M" || query.range === "1Y" ? query.range : "3M";

  const asset = await prisma.asset.findUnique({ where: { ticker: symbol } });
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

  const position =
    user && asset
      ? await prisma.position.findUnique({
          where: {
            userId_assetId: {
              userId: user.id,
              assetId: asset.id,
            },
          },
        })
      : null;

  let quote = null;
  let chartData: Awaited<ReturnType<typeof getYahooHistoricalPrices>> = [];
  let error = null;

  try {
    quote = await getFinnhubQuote(symbol);

    try {
      chartData = await getYahooHistoricalPrices(symbol, range);
    } catch {
      chartData = [];
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Erreur inconnue";
  }

  const quantity = Number(position?.quantity ?? 0);
  const avgPrice = Number(position?.avgPrice ?? 0);
  const currentPrice = quote?.c ?? 0;

  const positionValue = quantity * currentPrice;
  const investedValue = quantity * avgPrice;
  const positionProfitLoss = positionValue - investedValue;
  const positionProfitLossPercent =
    investedValue > 0 ? (positionProfitLoss / investedValue) * 100 : 0;

  const firstChartPrice = chartData[0]?.close ?? 0;
  const lastChartPrice = chartData[chartData.length - 1]?.close ?? 0;
  const chartChange = lastChartPrice - firstChartPrice;
  const chartChangePercent =
    firstChartPrice > 0 ? (chartChange / firstChartPrice) * 100 : 0;

  const chartHigh =
    chartData.length > 0
      ? Math.max(...chartData.map((item) => item.high ?? item.close))
      : 0;

  const chartLow =
    chartData.length > 0
      ? Math.min(...chartData.map((item) => item.low ?? item.close))
      : 0;

  const money = (value: number) =>
    formatCurrency(convertCurrency(Number(value ?? 0), "USD", displayCurrency), displayCurrency);

  if (!quote) {
    return (
      <main className="min-h-screen bg-[#020617] p-6 text-white">
        <div className="mx-auto max-w-6xl rounded-3xl border border-red-400/20 bg-red-400/10 p-6 text-red-300">
          {error ?? "Impossible de charger les données de marché."}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <AutoRefresh interval={30000} />

      <div className="pointer-events-none fixed left-1/2 top-0 h-125 w-125 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none fixed right-0 top-40 h-100 w-100 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
              {symbol} • Market Detail
            </div>

            <h1 className="text-4xl font-black md:text-5xl">
              {asset?.name ?? symbol}
            </h1>

            <p className="mt-3 text-slate-400">
              Données Finnhub + graphique Yahoo Finance.
            </p>
          </div>

          <AddToWatchlistButton ticker={symbol} />
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <Stat label="Prix actuel" value={money(quote.c)} />
          <Stat label="Ouverture" value={money(quote.o)} />
          <Stat label="Clôture précédente" value={money(quote.pc)} />
          <Stat label="Plus haut" value={money(quote.h)} />
          <Stat label="Plus bas" value={money(quote.l)} />
          <Stat
            label="Variation"
            value={`${quote.dp.toFixed(2)}%`}
            positive={quote.dp >= 0}
          />
        </section>

        <Card
          title="Graphique réel"
          action={<ChartRangeTabs ticker={symbol} />}
        >
          {chartData.length > 0 ? (
            <div className="space-y-6">
              <PriceChart data={chartData} currency={displayCurrency} />
              {/* <CandlestickChart data={chartData} currency={displayCurrency} /> */}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <MiniStat label="Début période" value={money(firstChartPrice)} />
                <MiniStat label="Fin période" value={money(lastChartPrice)} />
                <MiniStat
                  label="Variation"
                  value={money(chartChange)}
                  positive={chartChange >= 0}
                />
                <MiniStat
                  label="Variation %"
                  value={`${chartChangePercent.toFixed(2)}%`}
                  positive={chartChangePercent >= 0}
                />
                <MiniStat label="Haut / Bas" value={`${money(chartHigh)} / ${money(chartLow)}`} />
              </div>
            </div>
          ) : (
            <Empty text="Pas de données disponibles." />
          )}
        </Card>

        <Card title="Ma position">
          {position ? (
            <div className="grid gap-4 md:grid-cols-4">
              <MiniStat label="Quantité détenue" value={String(quantity)} />
              <MiniStat label="Prix moyen" value={money(avgPrice)} />
              <MiniStat label="Valeur actuelle" value={money(positionValue)} />
              <MiniStat
                label="P/L non réalisé"
                value={`${money(positionProfitLoss)} (${positionProfitLossPercent.toFixed(2)}%)`}
                positive={positionProfitLoss >= 0}
              />
            </div>
          ) : (
            <Empty text="Vous ne possédez pas encore cette action." />
          )}
        </Card>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card title="Achat / Vente">
            <TradeForm
              ticker={symbol}
              currentPrice={quote.c}
              ownedQuantity={quantity}
              currency={displayCurrency}
            />
          </Card>

          <Card title="Informations de l’action">
            <div className="grid gap-4 sm:grid-cols-2">
              <MiniStat label="Nom" value={asset?.name ?? symbol} />
              <MiniStat label="Ticker" value={symbol} />
              <MiniStat label="Exchange" value={asset?.exchange ?? "US"} />
              <MiniStat label="Devise" value={displayCurrency} />
            </div>
          </Card>
        </section>

        <QuickPriceAlertForm
          ticker={symbol}
          currentPrice={quote.c}
          currency={displayCurrency}
        />
      </div>
    </main>
  );
}

function Card({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-4xl border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-black">{title}</h2>
        {action}
      </div>
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

function MiniStat({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p
        className={`mt-1 font-black ${
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