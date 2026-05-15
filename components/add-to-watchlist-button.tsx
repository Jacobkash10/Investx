"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, Loader2 } from "lucide-react";

type AddToWatchlistButtonProps = {
  ticker: string;
};

export function AddToWatchlistButton({ ticker }: AddToWatchlistButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleAdd() {
    if (isPending) return;

    setIsPending(true);

    const formData = new FormData();
    formData.append("ticker", ticker);

    try {
      const { addToWatchlistAction } = await import(
        "@/app/(protected)/watchlist/actions"
      );

      await addToWatchlistAction(formData);

      toast.success(`${ticker} ajouté à la watchlist`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur ajout watchlist"
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={isPending}
      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Eye size={16} />
      )}

      <span className="hidden sm:inline">
        {isPending ? "Ajout..." : "Watchlist"}
      </span>
    </button>
  );
}