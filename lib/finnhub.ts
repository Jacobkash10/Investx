type CacheItem<T> = {
  data: T;
  expiresAt: number;
};

const quoteCache = new Map<string, CacheItem<FinnhubQuote>>();
const CACHE_TTL = 30 * 1000; // 30 secondes

export type FinnhubQuote = {
  c: number;  // current price
  d: number;  // change
  dp: number; // percent change
  h: number;  // high price of the day
  l: number;  // low price of the day
  o: number;  // open price of the day
  pc: number; // previous close price
  t: number;  // timestamp
};

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

export async function getFinnhubQuote(symbol: string): Promise<FinnhubQuote> {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    throw new Error("FINNHUB_API_KEY manquant");
  }

  const cleanSymbol = symbol.trim().toUpperCase();

  const cached = quoteCache.get(cleanSymbol);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const url = `https://finnhub.io/api/v1/quote?symbol=${cleanSymbol}&token=${apiKey}`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Erreur récupération prix");
  }

  const data = (await res.json()) as FinnhubQuote;

  if (!data.c || data.c <= 0) {
    throw new Error("Ticker invalide ou prix indisponible");
  }

  quoteCache.set(cleanSymbol, {
    data,
    expiresAt: Date.now() + CACHE_TTL,
  });

  return data;
}

export async function getFinnhubCandles(symbol: string) {
  try {
    const apiKey = process.env.FINNHUB_API_KEY;

    if (!apiKey) {
      return null;
    }

    const cleanSymbol = symbol.trim().toUpperCase();

    const now = Math.floor(Date.now() / 1000);
    const from = now - 60 * 60 * 24 * 30;

    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${cleanSymbol}&resolution=D&from=${from}&to=${now}&token=${apiKey}`;

    const res = await fetch(url, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    if (data.s !== "ok") {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export type FinnhubSymbol = {
  currency?: string;
  description: string;
  displaySymbol: string;
  figi?: string;
  mic?: string;
  symbol: string;
  type?: string;
};

export async function getFinnhubSymbols(exchange = "US") {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    throw new Error("FINNHUB_API_KEY manquant");
  }

  const url = `https://finnhub.io/api/v1/stock/symbol?exchange=${exchange}&token=${apiKey}`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Erreur récupération tickers Finnhub");
  }

  const data = (await res.json()) as FinnhubSymbol[];

  return data.filter(
    (item) =>
      item.symbol &&
      item.description &&
      item.type?.toLowerCase().includes("common")
  );
}