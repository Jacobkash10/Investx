"use client";

import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  HistogramSeries,
  ColorType,
  createChart,
  type CandlestickData,
  type HistogramData,
  type Time,
} from "lightweight-charts";

import {
  Currency,
  convertCurrency,
} from "@/lib/currency";

type CandlestickChartProps = {
  data: {
    date: string;
    open?: number;
    high?: number;
    low?: number;
    close: number;
    volume?: number;
  }[];
  currency?: Currency;
};

export function CandlestickChart({
  data,
  currency = "USD",
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const symbol = currency === "EUR" ? "€" : "$";

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 420,
      layout: {
        background: {
          type: ColorType.Solid,
          color: "#ffffff",
        },
        textColor: "#111827",
      },
      grid: {
        vertLines: {
          color: "#f3f4f6",
        },
        horzLines: {
          color: "#f3f4f6",
        },
      },
      rightPriceScale: {
        borderColor: "#e5e7eb",
      },
      timeScale: {
        borderColor: "#e5e7eb",
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#16a34a",
      downColor: "#dc2626",
      borderUpColor: "#16a34a",
      borderDownColor: "#dc2626",
      wickUpColor: "#16a34a",
      wickDownColor: "#dc2626",
      priceFormat: {
        type: "custom",
        formatter: (price: number) =>
          `${symbol} ${new Intl.NumberFormat("fr-FR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }).format(price)}`,
      },
    });

    const candleData: CandlestickData<Time>[] = data
      .filter(
        (item) =>
          item.open !== undefined &&
          item.high !== undefined &&
          item.low !== undefined &&
          item.close !== undefined
      )
      .map((item) => ({
        time: convertFrDateToTime(item.date),
        open: convertCurrency(Number(item.open), "USD", currency),
        high: convertCurrency(Number(item.high), "USD", currency),
        low: convertCurrency(Number(item.low), "USD", currency),
        close: convertCurrency(Number(item.close), "USD", currency),
      }));

    candleSeries.setData(candleData);

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "",
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    const volumeData: HistogramData<Time>[] = data.map((item) => ({
      time: convertFrDateToTime(item.date),
      value: Number(item.volume ?? 0),
      color:
        item.close >= Number(item.open ?? item.close)
          ? "rgba(22, 163, 74, 0.35)"
          : "rgba(220, 38, 38, 0.35)",
    }));

    volumeSeries.setData(volumeData);

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (!chartContainerRef.current) return;

      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, currency]);

  return <div ref={chartContainerRef} className="w-full" />;
}

function convertFrDateToTime(date: string): Time {
  const [day, month, year] = date.split("/");

  return `${year}-${month}-${day}` as Time;
}