"use client";

import { Download } from "lucide-react";

type PortfolioRow = {
  ticker: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  invested: number;
  marketValue: number;
  profitLoss: number;
  profitLossPercent: number;
};

type ExportPortfolioCsvProps = {
  rows: PortfolioRow[];
};

export function ExportPortfolioCsv({
  rows,
}: ExportPortfolioCsvProps) {
  function handleExport() {
    const headers = [
      "Ticker",
      "Name",
      "Quantity",
      "Average Price",
      "Current Price",
      "Invested",
      "Market Value",
      "Profit/Loss",
      "Profit/Loss %",
    ];

    const csvRows = rows.map((row) => [
      row.ticker,
      row.name,
      row.quantity,
      row.avgPrice.toFixed(2),
      row.currentPrice.toFixed(2),
      row.invested.toFixed(2),
      row.marketValue.toFixed(2),
      row.profitLoss.toFixed(2),
      row.profitLossPercent.toFixed(2),
    ]);

    const csvContent = [headers, ...csvRows]
      .map((row) =>
        row.map((cell) => `"${cell}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "investx-portfolio.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-bold text-cyan-300 backdrop-blur-xl transition-all duration-200 hover:scale-[1.02] hover:bg-cyan-400/20 hover:text-cyan-200 active:scale-[0.98]"
    >
      <Download className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />

      <span>Export CSV</span>
    </button>
  );
}