"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Camera, Loader2 } from "lucide-react";

export function CreateSnapshotButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/portfolio/snapshot",
        {
          method: "POST",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          data.error ?? "Erreur snapshot"
        );

        return;
      }

      toast.success(
        "Snapshot portefeuille créé"
      );

      router.refresh();
    } catch {
      toast.error(
        "Une erreur est survenue pendant la création du snapshot."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCreate}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-sm font-bold text-emerald-300 backdrop-blur-xl transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-400/20 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Création...
        </>
      ) : (
        <>
          <Camera className="h-4 w-4" />
          Créer snapshot
        </>
      )}
    </button>
  );
}