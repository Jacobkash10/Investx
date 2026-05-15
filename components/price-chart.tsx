"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Currency, formatCurrency } from "@/lib/currency";

type PriceChartProps = {
  data: {
    date: string;
    close: number;
    volume?: number;
  }[];
  currency?: Currency;
};

export function PriceChart({
  data,
  currency = "USD",
}: PriceChartProps) {
  const first = data[0]?.close ?? 0;
  const last = data[data.length - 1]?.close ?? 0;
  const isUp = last >= first;

  const chartColor = isUp ? "#34d399" : "#fb7185";

  return (
    <div className="space-y-6">
      <div className="h-80 w-full">
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
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.35} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              minTickGap={30}
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
                "Prix",
              ]}
            />

            <Area
              type="monotone"
              dataKey="close"
              stroke={chartColor}
              fill="url(#priceGradient)"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 6,
                stroke: "#020617",
                strokeWidth: 3,
                fill: chartColor,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="h-36 w-full rounded-2xl border border-white/10 bg-slate-950/40 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 8,
              right: 8,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              minTickGap={30}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#94a3b8",
                fontSize: 11,
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#94a3b8",
                fontSize: 11,
              }}
              tickFormatter={(value) =>
                Number(value).toLocaleString("fr-FR", {
                  notation: "compact",
                })
              }
              width={60}
            />

            <Tooltip
              cursor={{
                fill: "rgba(255,255,255,0.05)",
              }}
              contentStyle={{
                backgroundColor: "#020617",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                color: "#ffffff",
              }}
              labelStyle={{
                color: "#94a3b8",
              }}
              formatter={(value) => [
                Number(value).toLocaleString("fr-FR"),
                "Volume",
              ]}
            />

            <Bar
              dataKey="volume"
              fill={chartColor}
              radius={[8, 8, 0, 0]}
              opacity={0.75}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}