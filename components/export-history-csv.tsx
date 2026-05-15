"use client";

type HistoryRow = {
  date: string;
  ticker: string;
  side: "BUY" | "SELL";
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  realizedProfit?: number | null;
  status: string;
};

type ExportHistoryCsvProps = {
  rows: HistoryRow[];
};

export function ExportHistoryCsv({ rows }: ExportHistoryCsvProps) {
  function handleExport() {
    const headers = [
      "Date",
      "Ticker",
      "Type",
      "Quantity",
      "Unit Price",
      "Total Amount",
      "Realized Profit",
      "Status",
    ];

    const csvRows = rows.map((row) => [
      row.date,
      row.ticker,
      row.side,
      row.quantity,
      row.unitPrice.toFixed(2),
      row.totalAmount.toFixed(2),
      row.realizedProfit !== null && row.realizedProfit !== undefined
        ? row.realizedProfit.toFixed(2)
        : "",
      row.status,
    ]);

    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "investx-history.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
    >
      Export CSV
    </button>
  );
}