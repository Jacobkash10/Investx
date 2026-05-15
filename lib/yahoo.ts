import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export type ChartRange = "1M" | "3M" | "1Y";

export type YahooChartPoint = {
  date: string;
  close: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
};

type YahooHistoricalItem = {
  date: Date;
  close?: number | null;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  volume?: number | null;
};

export async function getYahooHistoricalPrices(
  symbol: string,
  range: ChartRange = "3M"
): Promise<YahooChartPoint[]> {
  const cleanSymbol = symbol.trim().toUpperCase();

  const endDate = new Date();
  const startDate = new Date();

  if (range === "1M") {
    startDate.setMonth(startDate.getMonth() - 1);
  }

  if (range === "3M") {
    startDate.setMonth(startDate.getMonth() - 3);
  }

  if (range === "1Y") {
    startDate.setFullYear(startDate.getFullYear() - 1);
  }

  const result = (await yahooFinance.historical(cleanSymbol, {
    period1: startDate,
    period2: endDate,
    interval: "1d",
  })) as YahooHistoricalItem[];

  return result
    .filter(
      (item) =>
        item.close !== null &&
        item.close !== undefined &&
        item.date instanceof Date
    )
    .map((item) => ({
      date: item.date.toLocaleDateString("fr-FR"),
      close: Number(item.close),
      open: item.open ? Number(item.open) : undefined,
      high: item.high ? Number(item.high) : undefined,
      low: item.low ? Number(item.low) : undefined,
      volume: item.volume ? Number(item.volume) : undefined,
    }));
}