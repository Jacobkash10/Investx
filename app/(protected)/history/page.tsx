import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { HistoryFilter } from "@/components/history-filter";
import { ExportHistoryCsv } from "@/components/export-history-csv";

import {
  Currency,
  convertCurrency,
  formatCurrency,
} from "@/lib/currency";

type HistoryPageProps = {
  searchParams: Promise<{
    side?: string;
    ticker?: string;
  }>;
};

export default async function HistoryPage({
  searchParams,
}: HistoryPageProps) {
  const params = await searchParams;
  const side = params.side;

  const ticker = params.ticker?.trim().toUpperCase();

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

      ...(side && side !== "ALL"
        ? {
            side: side as "BUY" | "SELL",
          }
        : {}),

      ...(ticker
        ? {
            asset: {
              ticker,
            },
          }
        : {}),
    },

    include: {
      asset: true,
      order: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const exportRows = transactions.map((transaction) => ({
    date: new Date(transaction.createdAt).toLocaleString("fr-FR"),
    ticker: transaction.asset.ticker,
    side: transaction.side,
    quantity: Number(transaction.quantity),

    unitPrice: convertCurrency(
      Number(transaction.unitPrice),
      "USD",
      displayCurrency
    ),

    totalAmount: convertCurrency(
      Number(transaction.totalAmount),
      "USD",
      displayCurrency
    ),

    realizedProfit:
      transaction.realizedProfit !== null
        ? convertCurrency(
            Number(transaction.realizedProfit),
            "USD",
            displayCurrency
          )
        : null,

    status: transaction.order.status,
  }));

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Historique</h1>

          <p className="text-gray-500">
            Toutes vos transactions passées.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <HistoryFilter />

          <ExportHistoryCsv rows={exportRows} />
        </div>

        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Ticker</th>
                <th className="p-4">Type</th>
                <th className="p-4">Quantité</th>
                <th className="p-4">Prix</th>
                <th className="p-4">Total</th>
                <th className="p-4">Profit réalisé</th>
                <th className="p-4">Statut</th>
              </tr>
            </thead>

            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td className="p-4 text-gray-500" colSpan={8}>
                    Aucune transaction pour le moment.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => {
                  const realizedProfit = Number(
                    transaction.realizedProfit ?? 0
                  );

                  return (
                    <tr key={transaction.id} className="border-t">
                      <td className="p-4">
                        {new Date(transaction.createdAt).toLocaleString(
                          "fr-FR"
                        )}
                      </td>

                      <td className="p-4 font-semibold">
                        {transaction.asset.ticker}
                      </td>

                      <td
                        className={`p-4 font-semibold ${
                          transaction.side === "BUY"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.side}
                      </td>

                      <td className="p-4">
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

                      <td className="p-4">
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
                        className={`p-4 font-semibold ${
                          realizedProfit >= 0
                            ? "text-green-600"
                            : "text-red-600"
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
                        {transaction.order.status}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}