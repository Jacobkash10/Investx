import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from "./actions";

export default async function NotificationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/connexion");
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    }),
  ]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none fixed left-1/2 top-0 h-125 w-125 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none fixed right-0 top-40 h-100 w-100 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
              Notifications • Activity Center
            </div>

            <h1 className="text-4xl font-black md:text-5xl">
              Notifications
            </h1>

            <p className="mt-3 text-slate-400">
              Historique de vos alertes et messages.
            </p>

            <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-400">
              <span
                className={`h-2 w-2 rounded-full ${
                  unreadCount > 0 ? "bg-cyan-400" : "bg-emerald-400"
                }`}
              />

              {unreadCount === 0
                ? "Toutes les notifications ont été lues"
                : `${unreadCount} notification${
                    unreadCount > 1 ? "s" : ""
                  } non lue${unreadCount > 1 ? "s" : ""}`}
            </p>
          </div>

          {unreadCount > 0 && (
            <form action={markAllNotificationsAsReadAction}>
              <button
                type="submit"
                className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-bold text-cyan-300 transition duration-300 hover:bg-cyan-400/20 hover:text-cyan-200"
              >
                Tout marquer comme lu
              </button>
            </form>
          )}
        </section>

        <Card title="Centre de notifications">
          {notifications.length === 0 ? (
            <Empty text="Aucune notification pour le moment." />
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-[1.75rem] border p-5 transition duration-300 hover:-translate-y-0.5 hover:bg-white/4 ${
                    notification.isRead
                      ? "border-white/10 bg-slate-950/60"
                      : "border-cyan-400/20 bg-cyan-400/10"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-black text-white">
                          {notification.title}
                        </h2>

                        <StatusBadge isRead={notification.isRead} />
                      </div>

                      <p className="mt-2 text-slate-400">
                        {notification.message}
                      </p>
                    </div>

                    <span className="whitespace-nowrap text-xs font-bold text-slate-500">
                      {new Intl.DateTimeFormat("fr-FR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(notification.createdAt))}
                    </span>
                  </div>

                  {!notification.isRead && (
                    <div className="mt-4 flex justify-end">
                      <form action={markNotificationAsReadAction}>
                        <input
                          type="hidden"
                          name="notificationId"
                          value={notification.id}
                        />

                        <button
                          type="submit"
                          className="rounded-2xl border border-white/10 bg-white/4 px-4 py-2 text-sm font-bold text-slate-300 transition duration-300 hover:border-cyan-400/20 hover:bg-cyan-400/10 hover:text-cyan-200"
                        >
                          Marquer comme lu
                        </button>
                      </form>
                    </div>
                  )}
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
      <h2 className="mb-5 text-xl font-black">{title}</h2>
      {children}
    </section>
  );
}

function StatusBadge({ isRead }: { isRead: boolean }) {
  const className = isRead
    ? "border-slate-400/20 bg-slate-400/10 text-slate-300"
    : "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-black ${className}`}
    >
      {isRead ? "Lu" : "Non lu"}
    </span>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-4xl border border-dashed border-white/10 bg-white/3 p-6 text-center text-slate-400">
      {text}
    </div>
  );
}