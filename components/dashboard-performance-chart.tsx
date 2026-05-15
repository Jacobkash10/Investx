"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Currency, formatCurrency } from "@/lib/currency";

type DashboardPerformanceChartProps = {
  data: {
    date: string;
    value: number;
  }[];
  currency?: Currency;
};

export function DashboardPerformanceChart({
  data,
  currency = "USD",
}: DashboardPerformanceChartProps) {
  const first = data[0]?.value ?? 0;
  const last = data[data.length - 1]?.value ?? 0;
  const isUp = last >= first;

  const strokeColor = isUp ? "#34d399" : "#fb7185";
  const fillColor = isUp ? "#34d399" : "#fb7185";

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 12,
            right: 12,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={fillColor} stopOpacity={0.35} />
              <stop offset="95%" stopColor={fillColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="4 4"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            minTickGap={25}
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#94a3b8",
              fontSize: 12,
            }}
          />

          <YAxis
            domain={["auto", "auto"]}
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#94a3b8",
              fontSize: 12,
            }}
            tickFormatter={(value) => formatCurrency(Number(value), currency)}
            width={80}
          />

          <Tooltip
            cursor={{
              stroke: "rgba(255,255,255,0.15)",
              strokeWidth: 1,
            }}
            contentStyle={{
              backgroundColor: "#020617",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              color: "#ffffff",
              boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
            }}
            labelStyle={{
              color: "#94a3b8",
              fontWeight: 600,
            }}
            itemStyle={{
              color: "#ffffff",
              fontWeight: 700,
            }}
            formatter={(value) => [
              formatCurrency(Number(value), currency),
              "Valeur du compte",
            ]}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            fill="url(#portfolioGradient)"
            strokeWidth={3}
            dot={false}
            activeDot={{
              r: 6,
              stroke: "#020617",
              strokeWidth: 3,
              fill: strokeColor,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}