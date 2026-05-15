"use client";

import { useRouter, useSearchParams } from "next/navigation";

const STATUS_CONFIG = {
  ALL: {
    label: "Tous",
    active:
      "border-white/20 bg-white/[0.12] text-white shadow-lg shadow-white/5",
  },

  PENDING: {
    label: "Pending",
    active:
      "border-yellow-400/30 bg-yellow-400/15 text-yellow-300 shadow-lg shadow-yellow-500/10",
  },

  EXECUTED: {
    label: "Executed",
    active:
      "border-emerald-400/30 bg-emerald-400/15 text-emerald-300 shadow-lg shadow-emerald-500/10",
  },

  CANCELLED: {
    label: "Cancelled",
    active:
      "border-red-400/30 bg-red-400/15 text-red-300 shadow-lg shadow-red-500/10",
  },

  REJECTED: {
    label: "Rejected",
    active:
      "border-pink-400/30 bg-pink-400/15 text-pink-300 shadow-lg shadow-pink-500/10",
  },
} as const;

export function OrdersFilter() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const currentStatus =
    searchParams.get("status") ?? "ALL";

  function handleChange(status: string) {
    if (status === "ALL") {
      router.push("/orders");
    } else {
      router.push(`/orders?status=${status}`);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {(
        Object.keys(STATUS_CONFIG) as Array<
          keyof typeof STATUS_CONFIG
        >
      ).map((status) => {
        const isActive = currentStatus === status;

        return (
          <button
            key={status}
            onClick={() => handleChange(status)}
            className={`rounded-2xl border px-5 py-3 text-sm font-bold backdrop-blur-xl transition-all duration-200 hover:scale-[1.02] ${
              isActive
                ? STATUS_CONFIG[status].active
                : "border-white/10 bg-white/4 text-slate-300 hover:bg-white/8"
            }`}
          >
            {STATUS_CONFIG[status].label}
          </button>
        );
      })}
    </div>
  );
}