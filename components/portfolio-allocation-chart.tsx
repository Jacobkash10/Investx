"use client";

import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
  Legend,
} from "recharts";

import { Currency, formatCurrency } from "@/lib/currency";

type PortfolioAllocationChartProps = {
  data: {
    ticker: string;
    value: number;
  }[];
  currency?: Currency;
};

const COLORS = [
  "#34d399",
  "#22d3ee",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
  "#fbbf24",
  "#fb7185",
  "#2dd4bf",
];

type CustomLabelProps = {
  name?: string;
  percent?: number;
};

export function PortfolioAllocationChart({
  data,
  currency = "USD",
}: PortfolioAllocationChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="relative h-80 w-full">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="-mt-8.75 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            Total
          </p>

          <p className="mt-1 text-xl font-black text-white">
            {formatCurrency(total, currency)}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="ticker"
            outerRadius={108}
            innerRadius={66}
            paddingAngle={5}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={2}
            labelLine={false}
            label={({ name, percent }: CustomLabelProps) => {
              const percentage = ((percent ?? 0) * 100).toFixed(1);

              if (Number(percentage) < 5) return "";

              return `${name ?? ""} ${percentage}%`;
            }}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
            contentStyle={{
              backgroundColor: "#020617",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "18px",
              color: "#ffffff",
              boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
            }}
            labelStyle={{
              color: "#94a3b8",
              fontWeight: 700,
            }}
            itemStyle={{
              color: "#ffffff",
              fontWeight: 800,
            }}
            formatter={(value) => [
              formatCurrency(Number(value), currency),
              "Valeur",
            ]}
          />

          <Legend
            iconType="circle"
            verticalAlign="bottom"
            wrapperStyle={{
              color: "#cbd5e1",
              fontSize: "13px",
              paddingTop: "18px",
              fontWeight: 700,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}