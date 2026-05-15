import { buyAsset } from "@/lib/trading";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { marketTradeSchema } from "@/lib/validations/trade";

export async function POST(request: Request) {
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

    const body = await request.json();

    const parsed = marketTradeSchema.safeParse({
      ticker: body.ticker,
      quantity: Number(body.quantity),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const result = await buyAsset({
      userId: session.user.id,
      ticker: parsed.data.ticker,
      quantity: parsed.data.quantity,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erreur serveur",
      },
      { status: 400 }
    );
  }
}