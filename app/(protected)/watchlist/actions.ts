"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  addToWatchlistSchema,
  removeFromWatchlistSchema,
} from "@/lib/validations/watchlist";

export async function addToWatchlistAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Non autorisé");
  }

  const parsed = addToWatchlistSchema.safeParse({
    ticker: formData.get("ticker"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const { ticker } = parsed.data;

  const asset = await prisma.asset.upsert({
    where: { ticker },
    update: {},
    create: {
      ticker,
      name: ticker,
      currency: "USD",
      type: "STOCK",
    },
  });

  await prisma.watchlist.upsert({
    where: {
      userId_assetId: {
        userId: session.user.id,
        assetId: asset.id,
      },
    },
    update: {},
    create: {
      userId: session.user.id,
      assetId: asset.id,
    },
  });

  revalidatePath("/watchlist");
}

export async function removeFromWatchlistAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Non autorisé");
  }

  const parsed = removeFromWatchlistSchema.safeParse({
    watchlistId: formData.get("watchlistId"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const { watchlistId } = parsed.data;

  await prisma.watchlist.deleteMany({
    where: {
      id: watchlistId,
      userId: session.user.id,
    },
  });

  revalidatePath("/watchlist");
}