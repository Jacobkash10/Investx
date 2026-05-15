"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";

type ChartRangeTabsProps = {
  ticker: string;
};

const ranges = ["1M", "3M", "1Y"] as const;

export function ChartRangeTabs({
  ticker,
}: ChartRangeTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  const currentRange =
    searchParams.get("range") ?? "3M";

  function handleRangeChange(range: string) {
    startTransition(() => {
      router.push(`/market/${ticker}?range=${range}`);
    });
  }

  return (
    <div className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
      {ranges.map((range) => {
        const active = currentRange === range;

        return (
          <button
            key={range}
            type="button"
            disabled={isPending}
            onClick={() => handleRangeChange(range)}
            className={`relative flex min-w-16 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ${
              active
                ? "bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/20"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            } ${
              isPending
                ? "cursor-not-allowed opacity-70"
                : ""
            }`}
          >
            {isPending && active ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : null}

            {range}
          </button>
        );
      })}
    </div>
  );
}