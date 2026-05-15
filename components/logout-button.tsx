"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await signOut();

    toast.success("Déconnexion réussie. À bientôt sur InvestX.");
    router.push("/connexion");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="group flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition duration-300 hover:bg-red-500/15 hover:text-red-400 cursor-pointer"
    >
      <LogOut
        size={18}
        className="transition duration-300 group-hover:-translate-x-0.5"
      />

      <span>Déconnexion</span>
    </button>
  );
}