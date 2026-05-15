import { z } from "zod";

export const addToWatchlistSchema = z.object({
  ticker: z
    .string()
    .trim()
    .min(1, "Ticker obligatoire")
    .max(10, "Ticker trop long")
    .transform((value) => value.toUpperCase()),
});

export const removeFromWatchlistSchema = z.object({
  watchlistId: z.string().min(1, "Élément introuvable"),
});