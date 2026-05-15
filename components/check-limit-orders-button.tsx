"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCcw } from "lucide-react";

export function CheckLimitOrdersButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleCheck() {
    try {
      setLoading(true);

      const res = await fetch("/api/trade/check-limits", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      if (data.executedCount === 0) {
        toast.info("Aucun ordre limite exécuté.");
      } else {
        toast.success(
          `${data.executedCount} ordre(s) limite exécuté(s).`
        );
      }

      router.refresh();
    } catch {
      toast.error("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCheck}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-bold text-cyan-300 backdrop-blur-xl transition-all duration-200 hover:scale-[1.02] hover:bg-cyan-400/20 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Vérification...
        </>
      ) : (
        <>
          <RefreshCcw className="h-4 w-4" />
          Vérifier les ordres limites
        </>
      )}
    </button>
  );
}