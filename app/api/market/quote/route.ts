import { getFinnhubQuote } from "@/lib/finnhub";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol is required" },
        { status: 400 }
      );
    }

    const quote = await getFinnhubQuote(symbol);

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      quote,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Server error",
      },
      { status: 400 }
    );
  }
}