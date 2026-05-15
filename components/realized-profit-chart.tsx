"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

import {
  Currency,
  formatCurrency,
} from "@/lib/currency";

type RealizedProfitChartProps = {
  data: {
    label: string;
    profit: number;
  }[];
  currency: Currency;
};

export function RealizedProfitChart({
  data,
  currency,
}: RealizedProfitChartProps) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 20,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.08)"
            vertical={false}
          />

          <XAxis
            dataKey="label"
            tick={{
              fill: "#94a3b8",
              fontSize: 12,
              fontWeight: 700,
            }}
            axisLine={{
              stroke: "rgba(255,255,255,0.1)",
            }}
            tickLine={false}
          />

          <YAxis
            tickFormatter={(value) =>
              formatCurrency(Number(value), currency)
            }
            tick={{
              fill: "#94a3b8",
              fontSize: 12,
              fontWeight: 700,
            }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            cursor={{
              fill: "rgba(255,255,255,0.04)",
            }}
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
              "Profit réalisé",
            ]}
          />

          <Bar
            dataKey="profit"
            radius={[12, 12, 4, 4]}
          >
            {data.map((item, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  item.profit >= 0
                    ? "#34d399"
                    : "#f87171"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}