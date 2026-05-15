"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import {
  createPriceAlertSchema,
  deletePriceAlertSchema,
} from "@/lib/validations/alert";

import {
  Currency,
  convertCurrency,
} from "@/lib/currency";

export async function createPriceAlertAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Non autorisé");
  }

  const currency = (
    formData.get("currency") === "EUR" ? "EUR" : "USD"
  ) as Currency;

  const parsed = createPriceAlertSchema.safeParse({
    ticker: formData.get("ticker"),
    targetPrice: Number(formData.get("targetPrice")),
    direction: formData.get("direction"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const { ticker, targetPrice, direction } = parsed.data;

  const targetPriceUsd = convertCurrency(targetPrice, currency, "USD");

  const asset = await prisma.asset.upsert({
    where: {
      ticker,
    },
    update: {},
    create: {
      ticker,
      name: ticker,
      currency: "USD",
      type: "STOCK",
    },
  });

  await prisma.priceAlert.create({
    data: {
      userId: session.user.id,
      assetId: asset.id,
      targetPrice: targetPriceUsd,
      direction: direction === "BELOW" ? "BELOW" : "ABOVE",
    },
  });

  revalidatePath("/alerts");
}

export async function deletePriceAlertAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Non autorisé");
  }

  const parsed = deletePriceAlertSchema.safeParse({
    alertId: formData.get("alertId"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const { alertId } = parsed.data;

  await prisma.priceAlert.deleteMany({
    where: {
      id: alertId,
      userId: session.user.id,
    },
  });

  revalidatePath("/alerts");
}