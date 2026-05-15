"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Adresse email invalide."),
  password: z
    .string()
    .min(1, "Le mot de passe est obligatoire."),
});

type FormErrors = Partial<Record<"email" | "password", string>>;

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isLoading) return;

    setErrors({});

    const validation = signInSchema.safeParse({
      email,
      password,
    });

    if (!validation.success) {
      const fieldErrors: FormErrors = {};

      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormErrors;
        fieldErrors[field] = issue.message;
      });

      setErrors(fieldErrors);
      toast.error("Veuillez corriger les erreurs du formulaire.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn.email({
        email: validation.data.email,
        password: validation.data.password,
      });

      if (result.error) {
        toast.error(result.error.message || "Email ou mot de passe incorrect.");
        return;
      }

      toast.success("Connexion réussie. Bienvenue sur InvestX.");

      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute -right-32 top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-16">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">
          <div className="hidden lg:block">
            <Link href="/" className="text-3xl font-black tracking-tight">
              Invest<span className="text-emerald-400">X</span>
            </Link>

            <h1 className="mt-8 max-w-xl text-5xl font-black leading-tight tracking-tight">
              Retrouvez votre portefeuille et vos performances.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
              Connectez-vous à votre espace InvestX pour suivre les marchés,
              gérer vos positions et analyser vos résultats en temps réel.
            </p>

            <div className="mt-10 grid max-w-md grid-cols-2 gap-4">
              <InfoCard title="Marchés Live" text="Données temps réel" />
              <InfoCard title="Analytics" text="Statistiques avancées" />
              <InfoCard title="Portfolio" text="Gestion intelligente" />
              <InfoCard title="Alertes" text="Notifications prix" />
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mx-auto w-full max-w-md rounded-4xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-8 text-center">
              <Link
                href="/"
                className="inline-block text-3xl font-black tracking-tight lg:hidden"
              >
                Invest<span className="text-emerald-400">X</span>
              </Link>

              <div className="mx-auto mt-5 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                Espace sécurisé
              </div>

              <h2 className="mt-5 text-3xl font-black">Connexion</h2>

              <p className="mt-2 text-sm text-slate-400">
                Connectez-vous pour accéder à votre dashboard.
              </p>
            </div>

            <div className="space-y-4">
              <FieldErrorInput
                label="Adresse email"
                placeholder="exemple@email.com"
                type="email"
                value={email}
                error={errors.email}
                onChange={setEmail}
              />

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-300">
                    Mot de passe
                  </label>

                  <Link
                    href="/mot-de-passe-oublie"
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                <FieldErrorInput
                  label=""
                  placeholder="Votre mot de passe"
                  type="password"
                  value={password}
                  error={errors.password}
                  onChange={setPassword}
                  hideLabel
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full cursor-pointer rounded-2xl bg-emerald-400 px-5 py-3.5 font-black text-slate-950 shadow-xl shadow-emerald-400/20 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </button>

            <p className="mt-6 text-center text-sm text-slate-400">
              Vous n’avez pas encore de compte ?{" "}
              <Link
                href="/inscription"
                className="font-bold text-emerald-400 hover:text-emerald-300"
              >
                Créer un compte
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

function FieldErrorInput({
  label,
  placeholder,
  type = "text",
  value,
  error,
  onChange,
  hideLabel = false,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  hideLabel?: boolean;
}) {
  return (
    <div>
      {!hideLabel && (
        <label className="mb-2 block text-sm font-semibold text-slate-300">
          {label}
        </label>
      )}

      <input
        className={`w-full rounded-2xl border bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:ring-4 ${
          error
            ? "border-red-400/70 focus:border-red-400 focus:ring-red-400/10"
            : "border-white/10 focus:border-emerald-400/60 focus:ring-emerald-400/10"
        }`}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
      />

      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
      <p className="text-xl font-black">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{text}</p>
    </div>
  );
}