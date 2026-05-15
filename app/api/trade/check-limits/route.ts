import { auth } from "@/lib/auth";
import { executePendingLimitOrders } from "@/lib/trading";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const executed = await executePendingLimitOrders(session.user.id);

    return NextResponse.json({
      success: true,
      executedCount: executed.length,
      executed,
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