// import { auth } from "@/lib/auth";
// import { getFinnhubSymbols } from "@/lib/finnhub";
// import { prisma } from "@/lib/prisma";
// import { headers } from "next/headers";
// import { NextResponse } from "next/server";

// export async function POST() {
//   try {
//     const session = await auth.api.getSession({
//       headers: await headers(),
//     });

//     if (!session?.user) {
//       return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
//     }

//     const symbols = await getFinnhubSymbols("US");

//     const limitedSymbols = symbols.slice(0, 200);

//     for (const item of limitedSymbols) {
//       await prisma.asset.upsert({
//         where: {
//           ticker: item.symbol,
//         },
//         update: {
//           name: item.description,
//           exchange: "US",
//           currency: item.currency ?? "USD",
//           type: "STOCK",
//         },
//         create: {
//           ticker: item.symbol,
//           name: item.description,
//           exchange: "US",
//           currency: item.currency ?? "USD",
//           type: "STOCK",
//         },
//       });
//     }

//     return NextResponse.json({
//       success: true,
//       synced: limitedSymbols.length,
//     });
//   } catch (error) {
//     return NextResponse.json(
//       {
//         error: error instanceof Error ? error.message : "Erreur serveur",
//       },
//       { status: 400 }
//     );
//   }
// }

import { auth } from "@/lib/auth";
import { getFinnhubSymbols } from "@/lib/finnhub";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const REQUIRED_TICKERS = [
  "AAPL",
  "MSFT",
  "NVDA",
  "TSLA",
  "AMZN",
  "GOOGL",
  "DIS"
];

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

    const symbols = await getFinnhubSymbols("US");

    const filteredSymbols = symbols.filter((item) => {
      return (
        item.symbol &&
        item.description &&
        !item.symbol.includes(".") &&
        !item.symbol.includes("-")
      );
    });

    const topTickers = filteredSymbols.filter((item) =>
      REQUIRED_TICKERS.includes(item.symbol)
    );

    const limitedSymbols = filteredSymbols.slice(0, 200);

    const finalSymbols = [
      ...topTickers,
      ...limitedSymbols,
    ];

    const uniqueSymbols = Array.from(
      new Map(finalSymbols.map((item) => [item.symbol, item])).values()
    );

    for (const item of uniqueSymbols) {
      await prisma.asset.upsert({
        where: {
          ticker: item.symbol,
        },
        update: {
          name: item.description,
          exchange: "US",
          currency: item.currency ?? "USD",
          type: "STOCK",
        },
        create: {
          ticker: item.symbol,
          name: item.description,
          exchange: "US",
          currency: item.currency ?? "USD",
          type: "STOCK",
        },
      });
    }

    return NextResponse.json({
      success: true,
      synced: uniqueSymbols.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur serveur",
      },
      { status: 400 }
    );
  }
}