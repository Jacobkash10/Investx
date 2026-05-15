import { prisma } from "@/lib/prisma";
import { getFinnhubQuote } from "@/lib/finnhub";

export async function createPortfolioSnapshot(userId: string) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    throw new Error("Wallet introuvable");
  }

  const positions = await prisma.position.findMany({
    where: { userId },
    include: { asset: true },
  });

  let portfolioValue = 0;

  for (const position of positions) {
    const quote = await getFinnhubQuote(position.asset.ticker);
    portfolioValue += Number(position.quantity) * quote.c;
  }

  const cashBalance = Number(wallet.cashBalance);
  const totalValue = cashBalance + portfolioValue;

  return prisma.portfolioSnapshot.create({
    data: {
      userId,
      cashBalance,
      portfolioValue,
      totalValue,
    },
  });
}