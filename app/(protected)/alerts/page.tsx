import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PriceAlertForm } from "@/components/price-alert-form";
import { deletePriceAlertAction } from "./actions";
import { CheckAlertsButton } from "@/components/check-alerts-button";
import { getFinnhubQuote } from "@/lib/finnhub";

import {
  Currency,
  convertCurrency,
  formatCurrency,
} from "@/lib/currency";

export default async function AlertsPage() {
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

  const alerts = await prisma.priceAlert.findMany({
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

  const alertsWithQuotes = await Promise.all(
    alerts.map(async (alert) => {
      try {
        const quote = await getFinnhubQuote(alert.asset.ticker);

        const currentPriceUsd = Number(quote.c);
        const targetPriceUsd = Number(alert.targetPrice);

        const currentPrice = convertCurrency(
          currentPriceUsd,
          "USD",
          displayCurrency
        );

        const targetPrice = convertCurrency(
          targetPriceUsd,
          "USD",
          displayCurrency
        );

        const distance = currentPrice - targetPrice;

        const distancePercent =
          targetPrice > 0 ? (distance / targetPrice) * 100 : 0;

        const isTriggered =
          alert.direction === "ABOVE"
            ? currentPriceUsd >= targetPriceUsd
            : currentPriceUsd <= targetPriceUsd;

        return {
          ...alert,
          currentPrice,
          targetPrice,
          distance,
          distancePercent,
          isTriggered,
        };
      } catch {
        return {
          ...alert,
          currentPrice: 0,
          targetPrice: convertCurrency(
            Number(alert.targetPrice),
            "USD",
            displayCurrency
          ),
          distance: 0,
          distancePercent: 0,
          isTriggered: false,
        };
      }
    })
  );

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none fixed left-1/2 top-0 h-125 w-125 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none fixed right-0 top-40 h-100 w-100 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
              Alerts • Price Monitoring
            </div>

            <h1 className="text-4xl font-black md:text-5xl">
              Alertes de prix
            </h1>

            <p className="mt-3 text-slate-400">
              Créez des alertes selon le prix d’un actif.
            </p>
          </div>

          <CheckAlertsButton />
        </section>

        <Card title="Créer une alerte">
          <PriceAlertForm currency={displayCurrency} />
        </Card>

        <Card title="Mes alertes">
          {alerts.length === 0 ? (
            <Empty text="Aucune alerte pour le moment." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {alertsWithQuotes.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 transition hover:bg-white/4"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xl font-black text-white">
                          {alert.asset.ticker}
                        </p>

                        <AlertBadge
                          isActive={alert.isActive}
                          isTriggered={alert.isTriggered}
                        />
                      </div>

                      <p className="mt-1 text-sm text-slate-400">
                        {alert.asset.name}
                      </p>
                    </div>

                    <form action={deletePriceAlertAction}>
                      <input
                        type="hidden"
                        name="alertId"
                        value={alert.id}
                      />

                      <button className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/20">
                        Supprimer
                      </button>
                    </form>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <MiniStat
                      label="Condition"
                      value={`${
                        alert.direction === "ABOVE"
                          ? "Au-dessus de"
                          : "En-dessous de"
                      } ${formatCurrency(
                        alert.targetPrice,
                        displayCurrency
                      )}`}
                    />

                    <MiniStat
                      label="Prix actuel"
                      value={formatCurrency(
                        alert.currentPrice,
                        displayCurrency
                      )}
                    />

                    <MiniStat
                      label="Écart"
                      value={`${
                        alert.distance >= 0 ? "+" : ""
                      }${formatCurrency(
                        alert.distance,
                        displayCurrency
                      )}`}
                      positive={alert.distance >= 0}
                    />

                    <MiniStat
                      label="Écart %"
                      value={`${alert.distancePercent.toFixed(
                        2
                      )}%`}
                      positive={alert.distance >= 0}
                    />
                  </div>
                </div>
              ))}
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
      <h2 className="mb-5 text-xl font-black">
        {title}
      </h2>

      {children}
    </section>
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
    <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
      <p className="text-sm text-slate-400">
        {label}
      </p>

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

function AlertBadge({
  isActive,
  isTriggered,
}: {
  isActive: boolean;
  isTriggered: boolean;
}) {
  const className = !isActive
    ? "border-slate-400/20 bg-slate-400/10 text-slate-300"
    : isTriggered
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
      : "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";

  const label = !isActive
    ? "Inactive"
    : isTriggered
      ? "Triggered"
      : "Active";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-black ${className}`}
    >
      {label}
    </span>
  );
}

function Empty({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 p-6 text-center text-slate-400">
      {text}
    </div>
  );
}