"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, RefreshCcw } from "lucide-react";

export function SyncAssetsButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleSync() {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/market/sync-assets",
        {
          method: "POST",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          data.error ?? "Erreur synchronisation"
        );

        return;
      }

      toast.success(
        `${data.synced} actions synchronisées`
      );

      router.refresh();
    } catch {
      toast.error(
        "Une erreur est survenue pendant la synchronisation."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSync}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-bold text-cyan-300 backdrop-blur-xl transition-all duration-200 hover:scale-[1.02] hover:bg-cyan-400/20 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Synchronisation...
        </>
      ) : (
        <>
          <RefreshCcw className="h-4 w-4" />
          Sync Finnhub Assets
        </>
      )}
    </button>
  );
}