import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { ChangePasswordForm } from "@/components/change-password-form";
import {
  convertCurrency,
  formatCurrency,
  Currency,
} from "@/lib/currency";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/connexion");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      wallet: true,
    },
  });

  if (!user) {
    redirect("/connexion");
  }

  const displayCurrency = (
    user.preferredCurrency === "EUR" ? "EUR" : "USD"
  ) as Currency;

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none fixed left-1/2 top-0 h-125 w-125 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none fixed right-0 top-40 h-100 w-100 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section>
          <div className="mb-4 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
            Account • InvestX
          </div>

          <h1 className="text-4xl font-black md:text-5xl">
            Profile
          </h1>

          <p className="mt-3 text-slate-400">
            Informations de votre compte InvestX.
          </p>
        </section>

        <Card title="Informations du compte">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? "Profile"}
                width={96}
                height={96}
                className="h-24 w-24 rounded-full border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/6 text-3xl font-black text-emerald-300">
                {user.name?.charAt(0)?.toUpperCase() ?? "U"}
              </div>
            )}

            <div className="grid flex-1 gap-4 md:grid-cols-2">
              <MiniStat label="Nom" value={user.name ?? "-"} />
              <MiniStat label="Email" value={user.email} />
              <MiniStat
                label="Email vérifié"
                value={user.emailVerified ? "Oui" : "Non"}
                positive={Boolean(user.emailVerified)}
              />
              <MiniStat
                label="Cash disponible"
                value={formatCurrency(
                  convertCurrency(
                    Number(user.wallet?.cashBalance ?? 0),
                    "USD",
                    displayCurrency
                  ),
                  displayCurrency
                )}
              />
              <MiniStat
                label="Devise"
                value={user.preferredCurrency ?? displayCurrency}
              />
            </div>
          </div>
        </Card>

        <Card title="Modifier le profile">
          <ProfileForm name={user.name} image={user.image} />
        </Card>

        <Card title="Sécurité">
          <ChangePasswordForm />
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
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 wrap-break-word font-black ${
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