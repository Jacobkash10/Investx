import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CheckLimitOrdersButton } from "@/components/check-limit-orders-button";
import { OrdersFilter } from "@/components/orders-filter";
import { cancelOrderAction } from "./actions";
import { Pagination } from "@/components/pagination";
import {
  Currency,
  convertCurrency,
  formatCurrency,
} from "@/lib/currency";

type OrdersPageProps = {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
};

export default async function OrdersPage({
  searchParams,
}: OrdersPageProps) {
  const params = await searchParams;
  const status = params.status;

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

  const page = Math.max(Number(params.page ?? 1), 1);
  const limit = 10;
  const skip = (page - 1) * limit;

  const where = {
    userId: session.user.id,
    ...(status && status !== "ALL"
      ? {
          status: status as "PENDING" | "EXECUTED" | "CANCELLED" | "REJECTED",
        }
      : {}),
  };

  const totalOrders = await prisma.order.count({ where });
  const totalPages = Math.ceil(totalOrders / limit);

  const orders = await prisma.order.findMany({
    where,
    include: {
      asset: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
  });

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none fixed left-1/2 top-0 h-125 w-125 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none fixed right-0 top-40 h-100 w-100 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
              Orders • Trading History
            </div>

            <h1 className="text-4xl font-black md:text-5xl">
              Mes ordres
            </h1>

            <p className="mt-3 text-slate-400">
              Liste de vos ordres Market et Limit.
            </p>
          </div>

          <CheckLimitOrdersButton />
        </section>

        <Card title="Filtres">
          <OrdersFilter />
        </Card>

        <Card title="Liste des ordres">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-250 text-left">
                <thead className="bg-white/6 text-sm text-slate-400">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Ticker</th>
                    <th className="p-4">Side</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Quantité</th>
                    <th className="p-4">Limit Price</th>
                    <th className="p-4">Executed Price</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td className="p-5 text-slate-400" colSpan={9}>
                        Aucun ordre pour le moment.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-t border-white/10 transition hover:bg-white/4"
                      >
                        <td className="p-4 text-sm text-slate-300">
                          {new Date(order.createdAt).toLocaleString("fr-FR")}
                        </td>

                        <td className="p-4 font-black text-white">
                          {order.asset.ticker}
                        </td>

                        <td
                          className={`p-4 font-black ${
                            order.side === "BUY"
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {order.side}
                        </td>

                        <td className="p-4 font-semibold text-slate-200">
                          {order.orderType}
                        </td>

                        <td className="p-4 font-semibold">
                          {Number(order.quantity)}
                        </td>

                        <td className="p-4">
                          {order.limitPrice
                            ? formatCurrency(
                                convertCurrency(
                                  Number(order.limitPrice),
                                  "USD",
                                  displayCurrency
                                ),
                                displayCurrency
                              )
                            : "-"}
                        </td>

                        <td className="p-4">
                          {order.executedPrice
                            ? formatCurrency(
                                convertCurrency(
                                  Number(order.executedPrice),
                                  "USD",
                                  displayCurrency
                                ),
                                displayCurrency
                              )
                            : "-"}
                        </td>

                        <td className="p-4">
                          <StatusBadge status={order.status} />
                        </td>

                        <td className="p-4">
                          {order.orderType === "LIMIT" &&
                          order.status === "PENDING" ? (
                            <form action={cancelOrderAction}>
                              <input
                                type="hidden"
                                name="orderId"
                                value={order.id}
                              />

                              <button className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/20">
                                Annuler
                              </button>
                            </form>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
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
          basePath="/orders"
          searchParams={{
            status,
          }}
        />
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

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "EXECUTED"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
      : status === "PENDING"
        ? "border-yellow-400/20 bg-yellow-400/10 text-yellow-300"
        : "border-red-400/20 bg-red-400/10 text-red-300";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-black ${className}`}
    >
      {status}
    </span>
  );
}