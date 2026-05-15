import { z } from "zod";

export const createPriceAlertSchema = z.object({
  ticker: z
    .string()
    .trim()
    .min(1, "Ticker obligatoire")
    .max(10, "Ticker trop long")
    .transform((value) => value.toUpperCase()),

  targetPrice: z
    .number()
    .positive("Le prix cible doit être supérieur à 0"),

  direction: z.enum(["ABOVE", "BELOW"], {
    error: "Direction invalide",
  }),
});

export const deletePriceAlertSchema = z.object({
  alertId: z.string().min(1, "Alerte introuvable"),
});