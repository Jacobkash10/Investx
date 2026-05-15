import { z } from "zod";

export const marketTradeSchema = z.object({
  ticker: z
    .string()
    .trim()
    .min(1, "Ticker obligatoire")
    .max(10, "Ticker trop long")
    .transform((value) => value.toUpperCase()),

  quantity: z
    .number({
      error: "Quantité obligatoire",
    })
    .positive("La quantité doit être supérieure à 0"),
});

export const limitOrderSchema = z.object({
  ticker: z
    .string()
    .trim()
    .min(1, "Ticker obligatoire")
    .max(10, "Ticker trop long")
    .transform((value) => value.toUpperCase()),

  quantity: z.number().positive("La quantité doit être supérieure à 0"),

  side: z.enum(["BUY", "SELL"], {
    error: "Type d’ordre invalide",
  }),

  limitPrice: z.number().positive("Le prix limite doit être supérieur à 0"),
});