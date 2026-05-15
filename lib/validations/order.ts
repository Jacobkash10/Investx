import { z } from "zod";

export const cancelOrderSchema = z.object({
  orderId: z.string().min(1, "Ordre introuvable"),
});