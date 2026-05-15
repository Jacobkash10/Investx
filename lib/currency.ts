export type Currency = "USD" | "EUR";

const USD_TO_EUR_RATE = 0.92;

export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency
) {
  if (from === to) return amount;

  if (from === "USD" && to === "EUR") {
    return amount * USD_TO_EUR_RATE;
  }

  if (from === "EUR" && to === "USD") {
    return amount / USD_TO_EUR_RATE;
  }

  return amount;
}

export function formatCurrency(
  amount: number,
  currency: Currency = "USD"
) {
  const symbol = currency === "EUR" ? "€" : "$";

  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${symbol} ${formatted}`;
}