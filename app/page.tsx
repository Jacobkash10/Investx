import Link from "next/link";

const features = [
  {
    icon: "📈",
    title: "Marchés en temps réel",
    description:
      "Suivez les mouvements du marché avec des données claires, rapides et faciles à comprendre.",
  },
  {
    icon: "🕯️",
    title: "Graphiques avancés",
    description:
      "Analysez les tendances, les chandeliers, les volumes et l’évolution des prix.",
  },
  {
    icon: "💼",
    title: "Gestion de portefeuille",
    description:
      "Suivez vos positions, votre allocation, vos gains, vos pertes et votre performance globale.",
  },
  {
    icon: "🔔",
    title: "Alertes intelligentes",
    description:
      "Recevez des notifications lorsque le prix atteint vos objectifs importants.",
  },
  {
    icon: "⏳",
    title: "Ordres Market & Limit",
    description:
      "Placez des ordres simples ou avancés selon votre stratégie d’investissement.",
  },
  {
    icon: "📊",
    title: "Analytics professionnels",
    description:
      "Visualisez vos performances, votre win rate, vos meilleurs trades et votre évolution.",
  },
];

const steps = [
  {
    title: "Créer un compte",
    description:
      "Accédez à votre espace personnel et configurez votre profil investisseur.",
  },
  {
    title: "Explorer le marché",
    description:
      "Recherchez des actions comme AAPL, TSLA ou NVDA avec des données de marché.",
  },
  {
    title: "Construire votre stratégie",
    description:
      "Achetez, vendez, placez des ordres et organisez votre portefeuille.",
  },
  {
    title: "Analyser vos résultats",
    description:
      "Suivez vos performances, vos positions et vos décisions en temps réel.",
  },
];

const benefits = [
  "Interface moderne et facile à utiliser",
  "Suivi clair du portefeuille",
  "Graphiques et statistiques avancées",
  "Alertes de prix personnalisées",
  "Analyse des gains, pertes et performances",
  "Expérience adaptée aux débutants et investisseurs avancés",
];

const faqs = [
  {
    question: "À qui s’adresse InvestX ?",
    answer:
      "InvestX s’adresse aux personnes qui veulent suivre les marchés, organiser leur portefeuille et mieux comprendre leurs performances d’investissement.",
  },
  {
    question: "La plateforme affiche-t-elle des données de marché ?",
    answer:
      "Oui, InvestX peut afficher des données de marché, des graphiques, des prix, des performances et des informations utiles sur les actifs.",
  },
  {
    question: "Est-ce adapté aux débutants ?",
    answer:
      "Oui. L’interface est pensée pour être simple, claire et professionnelle, même pour une personne qui découvre l’investissement.",
  },
];

export default function LandingPage() {
  return (
    <main
      className={`min-h-screen overflow-hidden bg-[#020617] text-white`}
    >
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight"
          >
            Invest<span className="text-emerald-400">X</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
            <a href="#features" className="transition hover:text-white">
              Fonctionnalités
            </a>
            <a href="#how-it-works" className="transition hover:text-white">
              Processus
            </a>
            <a href="#analytics" className="transition hover:text-white">
              Analytics
            </a>
            <a href="#faq" className="transition hover:text-white">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/connexion"
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Connexion
            </Link>

            <Link
              href="/inscription"
              className="rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-400/20 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-300"
            >
              Commencer
            </Link>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="animate-pulse-slow absolute left-1/2 -top-30 h-130 w-130 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="animate-pulse-slow absolute -right-30 top-40 h-105 w-105 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 lg:grid-cols-2">
          <div className="animate-fade-up">
            <div className="mb-6 inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
              Plateforme moderne d’investissement & analytics
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
              Investissez avec une vision claire du marché.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              InvestX vous aide à suivre les marchés, gérer votre portefeuille,
              analyser vos performances et prendre de meilleures décisions
              grâce à des outils simples, puissants et professionnels.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/inscription"
                className="rounded-2xl bg-emerald-400 px-7 py-4 text-center font-black text-slate-950 shadow-xl shadow-emerald-400/20 transition duration-300 hover:-translate-y-1 hover:bg-emerald-300"
              >
                Créer un compte
              </Link>

              <Link
                href="/connexion"
                className="rounded-2xl border border-white/15 bg-white/5 px-7 py-4 text-center font-bold text-white transition duration-300 hover:bg-white/10"
              >
                Accéder à la plateforme
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-5">
              <Metric value="Live" label="Données marché" />
              <Metric value="+17%" label="Performance" />
              <Metric value="24/7" label="Suivi portfolio" />
            </div>
          </div>

          <div className="animate-float">
            <div className="glow-card rounded-4xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[1.6rem] bg-slate-950 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Valeur du compte</p>
                    <h2 className="mt-2 text-4xl font-black">$100 242,51</h2>
                    <p className="mt-2 font-semibold text-emerald-400">
                      +$242,51 • +17.01%
                    </p>
                  </div>

                  <div className="rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
                    Marché ouvert
                  </div>
                </div>

                <div className="mt-8 h-56 rounded-3xl border border-white/10 bg-linear-to-t from-emerald-500/20 to-white/5 p-5">
                  <svg viewBox="0 0 500 180" className="h-full w-full">
                    <path
                      d="M0 140 C70 110 90 55 160 72 C230 88 260 135 330 82 C390 35 445 52 500 25"
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="8"
                      strokeLinecap="round"
                      className="animate-chart"
                    />
                    <path
                      d="M0 140 C70 110 90 55 160 72 C230 88 260 135 330 82 C390 35 445 52 500 25 L500 180 L0 180 Z"
                      fill="rgba(52,211,153,0.16)"
                    />
                  </svg>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <Card label="Cash" value="$98 756" />
                  <Card label="Portfolio" value="$1 486" />
                  <Card label="Profit" value="+$242" positive />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <p className="font-bold text-emerald-400">Fonctionnalités</p>
        <h2 className="mt-3 max-w-3xl text-4xl font-black md:text-5xl">
          Tous les outils essentiels pour suivre et comprendre vos investissements.
        </h2>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-[1.7rem] border border-white/10 bg-white/6 p-6 transition duration-500 hover:-translate-y-2 hover:bg-white/9"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-2xl">
                {feature.icon}
              </div>
              <h3 className="text-xl font-black">{feature.title}</h3>
              <p className="mt-3 leading-7 text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="border-y border-white/10 bg-white/4 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2">
          <div>
            <p className="font-bold text-emerald-400">Pourquoi InvestX ?</p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              Une expérience claire, moderne et professionnelle.
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              La plateforme aide l’utilisateur à comprendre son portefeuille,
              suivre les marchés et prendre des décisions avec plus de visibilité.
            </p>
          </div>

          <div className="grid gap-4">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 font-semibold"
              >
                ✓ {benefit}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24">
        <p className="font-bold text-emerald-400">Processus</p>
        <h2 className="mt-3 text-4xl font-black md:text-5xl">
          De l’analyse à la décision.
        </h2>

        <div className="mt-12 grid gap-5 md:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-[1.7rem] border border-white/10 bg-white/6 p-6"
            >
              <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400 font-black text-slate-950">
                {index + 1}
              </div>
              <h3 className="font-black">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ANALYTICS */}
      <section id="analytics" className="border-y border-white/10 bg-white/4 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
          <div>
            <p className="font-bold text-emerald-400">Analytics Pro</p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              Comprenez vos performances en profondeur.
            </h2>
            <p className="mt-6 leading-8 text-slate-300">
              InvestX vous donne une vision complète de votre portefeuille :
              profits réalisés, profits non réalisés, allocation, positions,
              performances mensuelles et décisions importantes.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Stat label="Win Rate" value="72%" />
              <Stat label="Meilleur trade" value="+$182" />
              <Stat label="Profit total" value="+$242" />
              <Stat label="Positions" value="4" />
            </div>
          </div>

          <div className="rounded-4xl border border-white/10 bg-white/6 p-6">
            <h3 className="text-2xl font-black">Allocation portefeuille</h3>

            <div className="mt-8 grid gap-5">
              <Allocation label="AAPL" value="39.5%" />
              <Allocation label="NVDA" value="29.0%" />
              <Allocation label="TSLA" value="28.8%" />
              <Allocation label="ALCO" value="2.7%" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-5xl px-6 py-24">
        <div className="text-center">
          <p className="font-bold text-emerald-400">FAQ</p>
          <h2 className="mt-3 text-4xl font-black md:text-5xl">
            Questions fréquentes
          </h2>
        </div>

        <div className="mt-12 grid gap-4">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-2xl border border-white/10 bg-white/6 p-6"
            >
              <h3 className="font-black">{faq.question}</h3>
              <p className="mt-3 leading-7 text-slate-300">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl rounded-4xl bg-linear-to-br from-emerald-400 to-cyan-400 px-8 py-16 text-center text-slate-950">
          <h2 className="text-4xl font-black md:text-5xl">
            Prenez le contrôle de votre portefeuille.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-slate-800">
            Une interface moderne pour suivre le marché, gérer vos positions et
            analyser vos performances avec clarté.
          </p>

          <Link
            href="/inscription"
            className="mt-8 inline-flex rounded-2xl bg-slate-950 px-8 py-4 font-black text-white hover:bg-slate-800"
          >
            Commencer maintenant
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© 2026 InvestX. Plateforme d’investissement et d’analyse.</p>
          <p>Données de marché • Portefeuille • Analytics • Performance</p>
        </div>
      </footer>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 p-4 transition duration-300 hover:-translate-y-1 hover:bg-white/9">
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </div>
  );
}

function Card({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-1 font-black ${positive ? "text-emerald-400" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function Allocation({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-bold">{label}</span>
        <span className="text-slate-300">{value}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-emerald-400" style={{ width: value }} />
      </div>
    </div>
  );
}