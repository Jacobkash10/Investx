import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFinnhubQuote } from "@/lib/finnhub";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const alerts = await prisma.priceAlert.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      include: {
        asset: true,
      },
    });

    const triggeredAlerts = [];

    for (const alert of alerts) {
      const quote = await getFinnhubQuote(alert.asset.ticker);
      const currentPrice = quote.c;
      const targetPrice = Number(alert.targetPrice);

      const isTriggered =
        alert.direction === "ABOVE"
          ? currentPrice >= targetPrice
          : currentPrice <= targetPrice;

      if (isTriggered) {
        await prisma.priceAlert.update({
          where: {
            id: alert.id,
          },
          data: {
            isActive: false,
          },
        });

        await prisma.notification.create({
          data: {
            userId: session.user.id,
            title: `Alerte déclenchée: ${alert.asset.ticker}`,
            message: `${alert.asset.ticker} est maintenant à $${currentPrice.toFixed(
              2
            )}. Prix cible: $${targetPrice.toFixed(2)}.`,
            type: "PRICE_ALERT",
          },
        });

        triggeredAlerts.push({
          id: alert.id,
          ticker: alert.asset.ticker,
          direction: alert.direction,
          targetPrice,
          currentPrice,
        });
      }
    }

    return NextResponse.json({
      success: true,
      checked: alerts.length,
      triggered: triggeredAlerts,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erreur serveur",
      },
      { status: 400 }
    );
  }
}