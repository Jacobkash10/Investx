import { prisma } from "@/lib/prisma";
import { getFinnhubQuote } from "@/lib/finnhub";
import { createPortfolioSnapshot } from "@/lib/portfolio-snapshot";

export async function buyAsset({
  userId,
  ticker,
  quantity,
}: {
  userId: string;
  ticker: string;
  quantity: number;
}) {
  if (!ticker) {
    throw new Error("Ticker obligatoire");
  }

  if (!quantity || quantity <= 0) {
    throw new Error("Quantité invalide");
  }

  const symbol = ticker.trim().toUpperCase();

  const quote = await getFinnhubQuote(symbol);
  const price = quote.c;

  if (!price || price <= 0) {
    throw new Error("Prix invalide");
  }

  const totalCost = price * quantity;

  const result = await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({
      where: {
        userId,
      },
    });

    if (!wallet) {
      throw new Error("Wallet introuvable");
    }

    if (Number(wallet.cashBalance) < totalCost) {
      throw new Error("Solde insuffisant");
    }

    const asset = await tx.asset.upsert({
      where: {
        ticker: symbol,
      },
      update: {},
      create: {
        ticker: symbol,
        name: symbol,
        currency: "USD",
        type: "STOCK",
      },
    });

    const existingPosition = await tx.position.findUnique({
      where: {
        userId_assetId: {
          userId,
          assetId: asset.id,
        },
      },
    });

    if (existingPosition) {
      const oldQuantity = Number(existingPosition.quantity);
      const oldAvgPrice = Number(existingPosition.avgPrice);

      const newQuantity = oldQuantity + quantity;

      const newAvgPrice =
        (oldQuantity * oldAvgPrice + quantity * price) / newQuantity;

      await tx.position.update({
        where: {
          id: existingPosition.id,
        },
        data: {
          quantity: newQuantity,
          avgPrice: newAvgPrice,
        },
      });
    } else {
      await tx.position.create({
        data: {
          userId,
          assetId: asset.id,
          quantity,
          avgPrice: price,
        },
      });
    }

    const order = await tx.order.create({
      data: {
        userId,
        assetId: asset.id,
        side: "BUY",
        orderType: "MARKET",
        quantity,
        executedPrice: price,
        status: "EXECUTED",
        executedAt: new Date(),
      },
    });

    await tx.wallet.update({
      where: {
        userId,
      },
      data: {
        cashBalance: {
          decrement: totalCost,
        },
      },
    });

    await tx.transaction.create({
      data: {
        userId,
        orderId: order.id,
        assetId: asset.id,
        side: "BUY",
        quantity,
        unitPrice: price,
        totalAmount: totalCost,
        currency: "USD",
      },
    });

    return {
      success: true,
      symbol,
      quantity,
      price,
      totalCost,
    };
  });

  await createPortfolioSnapshot(userId);

  await prisma.notification.create({
    data: {
      userId,
      title: `Achat exécuté : ${symbol}`,
      message: `BUY ${quantity} ${symbol} exécuté à $${price.toFixed(
        2
      )}. Total : $${totalCost.toFixed(2)}.`,
      type: "TRADE",
    },
  });

  return result;
}

export async function sellAsset({
  userId,
  ticker,
  quantity,
}: {
  userId: string;
  ticker: string;
  quantity: number;
}) {
  if (!ticker) {
    throw new Error("Ticker obligatoire");
  }

  if (!quantity || quantity <= 0) {
    throw new Error("Quantité invalide");
  }

  const symbol = ticker.trim().toUpperCase();

  const quote = await getFinnhubQuote(symbol);
  const price = quote.c;

  if (!price || price <= 0) {
    throw new Error("Prix invalide");
  }

  const totalAmount = price * quantity;

  const result = await prisma.$transaction(async (tx) => {
    const asset = await tx.asset.findUnique({
      where: {
        ticker: symbol,
      },
    });

    if (!asset) {
      throw new Error("Actif introuvable");
    }

    const position = await tx.position.findUnique({
      where: {
        userId_assetId: {
          userId,
          assetId: asset.id,
        },
      },
    });

    if (!position) {
      throw new Error("Vous ne possédez pas cet actif");
    }

    const currentQuantity = Number(position.quantity);

    if (currentQuantity < quantity) {
      throw new Error("Quantité insuffisante");
    }

    const avgPrice = Number(position.avgPrice);
    const realizedProfit = (price - avgPrice) * quantity;

    const newQuantity = currentQuantity - quantity;

    const order = await tx.order.create({
      data: {
        userId,
        assetId: asset.id,
        side: "SELL",
        orderType: "MARKET",
        quantity,
        executedPrice: price,
        status: "EXECUTED",
        executedAt: new Date(),
      },
    });

    if (newQuantity === 0) {
      await tx.position.delete({
        where: {
          id: position.id,
        },
      });
    } else {
      await tx.position.update({
        where: {
          id: position.id,
        },
        data: {
          quantity: newQuantity,
        },
      });
    }

    await tx.wallet.update({
      where: {
        userId,
      },
      data: {
        cashBalance: {
          increment: totalAmount,
        },
      },
    });

    await tx.transaction.create({
      data: {
        userId,
        orderId: order.id,
        assetId: asset.id,
        side: "SELL",
        quantity,
        unitPrice: price,
        totalAmount,
        realizedProfit,
        currency: "USD",
      },
    });

    return {
      success: true,
      symbol,
      quantity,
      price,
      totalAmount,
    };
  });

  await createPortfolioSnapshot(userId);

  await prisma.notification.create({
    data: {
      userId,
      title: `Vente exécutée : ${symbol}`,
      message: `SELL ${quantity} ${symbol} exécuté à $${price.toFixed(
        2
      )}. Total : $${totalAmount.toFixed(2)}.`,
      type: "TRADE",
    },
  });

  return result;
}

export async function createLimitOrder({
  userId,
  ticker,
  quantity,
  side,
  limitPrice,
}: {
  userId: string;
  ticker: string;
  quantity: number;
  side: "BUY" | "SELL";
  limitPrice: number;
}) {
  if (!ticker) throw new Error("Ticker obligatoire");
  if (!quantity || quantity <= 0) throw new Error("Quantité invalide");
  if (!limitPrice || limitPrice <= 0) throw new Error("Prix limite invalide");

  const symbol = ticker.trim().toUpperCase();

  return await prisma.$transaction(async (tx) => {
    const asset = await tx.asset.upsert({
      where: {
        ticker: symbol,
      },
      update: {},
      create: {
        ticker: symbol,
        name: symbol,
        currency: "USD",
        type: "STOCK",
      },
    });

    if (side === "BUY") {
      const wallet = await tx.wallet.findUnique({
        where: {
          userId,
        },
      });

      if (!wallet) throw new Error("Wallet introuvable");

      const estimatedCost = quantity * limitPrice;

      if (Number(wallet.cashBalance) < estimatedCost) {
        throw new Error("Solde insuffisant pour cet ordre limite");
      }
    }

    if (side === "SELL") {
      const position = await tx.position.findUnique({
        where: {
          userId_assetId: {
            userId,
            assetId: asset.id,
          },
        },
      });

      if (!position) {
        throw new Error("Vous ne possédez pas cet actif");
      }

      if (Number(position.quantity) < quantity) {
        throw new Error("Quantité insuffisante pour cet ordre limite");
      }
    }

    const order = await tx.order.create({
      data: {
        userId,
        assetId: asset.id,
        side,
        orderType: "LIMIT",
        quantity,
        limitPrice,
        status: "PENDING",
      },
    });

    return {
      success: true,
      order,
    };
  });
}

export async function executePendingLimitOrders(userId: string) {
  const pendingOrders = await prisma.order.findMany({
    where: {
      userId,
      orderType: "LIMIT",
      status: "PENDING",
    },
    include: {
      asset: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const executedOrders = [];

  for (const order of pendingOrders) {
    const quote = await getFinnhubQuote(order.asset.ticker);
    const currentPrice = quote.c;
    const limitPrice = Number(order.limitPrice);
    const quantity = Number(order.quantity);

    const shouldExecute =
      order.side === "BUY"
        ? currentPrice <= limitPrice
        : currentPrice >= limitPrice;

    if (!shouldExecute) continue;

    let wasExecuted = false;

    await prisma.$transaction(async (tx) => {
      try {
        if (order.side === "BUY") {
          const wallet = await tx.wallet.findUnique({
            where: { userId },
          });

          if (!wallet) {
            throw new Error("Wallet introuvable");
          }

          const totalCost = currentPrice * quantity;

          if (Number(wallet.cashBalance) < totalCost) {
            await tx.order.update({
              where: { id: order.id },
              data: { status: "REJECTED" },
            });

            return;
          }

          const existingPosition = await tx.position.findUnique({
            where: {
              userId_assetId: {
                userId,
                assetId: order.assetId,
              },
            },
          });

          if (existingPosition) {
            const oldQuantity = Number(existingPosition.quantity);
            const oldAvgPrice = Number(existingPosition.avgPrice);
            const newQuantity = oldQuantity + quantity;

            const newAvgPrice =
              (oldQuantity * oldAvgPrice + quantity * currentPrice) /
              newQuantity;

            await tx.position.update({
              where: { id: existingPosition.id },
              data: {
                quantity: newQuantity,
                avgPrice: newAvgPrice,
              },
            });
          } else {
            await tx.position.create({
              data: {
                userId,
                assetId: order.assetId,
                quantity,
                avgPrice: currentPrice,
              },
            });
          }

          await tx.wallet.update({
            where: { userId },
            data: {
              cashBalance: {
                decrement: totalCost,
              },
            },
          });

          await tx.transaction.create({
            data: {
              userId,
              orderId: order.id,
              assetId: order.assetId,
              side: "BUY",
              quantity,
              unitPrice: currentPrice,
              totalAmount: totalCost,
              currency: "USD",
            },
          });
        }

        if (order.side === "SELL") {
          const position = await tx.position.findUnique({
            where: {
              userId_assetId: {
                userId,
                assetId: order.assetId,
              },
            },
          });

          if (!position) {
            await tx.order.update({
              where: { id: order.id },
              data: { status: "REJECTED" },
            });

            return;
          }

          const currentQuantity = Number(position.quantity);

          if (currentQuantity < quantity) {
            await tx.order.update({
              where: { id: order.id },
              data: { status: "REJECTED" },
            });

            return;
          }

          const totalAmount = currentPrice * quantity;
          const newQuantity = currentQuantity - quantity;
          const avgPrice = Number(position.avgPrice);
          const realizedProfit = (currentPrice - avgPrice) * quantity;

          if (newQuantity === 0) {
            await tx.position.delete({
              where: { id: position.id },
            });
          } else {
            await tx.position.update({
              where: { id: position.id },
              data: {
                quantity: newQuantity,
              },
            });
          }

          await tx.wallet.update({
            where: { userId },
            data: {
              cashBalance: {
                increment: totalAmount,
              },
            },
          });

          await tx.transaction.create({
            data: {
              userId,
              orderId: order.id,
              assetId: order.assetId,
              side: "SELL",
              quantity,
              unitPrice: currentPrice,
              totalAmount,
              realizedProfit,
              currency: "USD",
            },
          });
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "EXECUTED",
            executedPrice: currentPrice,
            executedAt: new Date(),
          },
        });

        wasExecuted = true;
      } catch (error) {
        await tx.order.update({
          where: { id: order.id },
          data: { status: "REJECTED" },
        });

        throw error;
      }
    });

    if (wasExecuted) {
      await createPortfolioSnapshot(userId);

      await prisma.notification.create({
        data: {
          userId,
          title: `Ordre limite exécuté: ${order.asset.ticker}`,
          message: `${order.side} LIMIT ${order.asset.ticker} exécuté à $${currentPrice.toFixed(
            2
          )}. Quantité: ${quantity}.`,
          type: "LIMIT_ORDER",
        },
      });

      executedOrders.push({
        id: order.id,
        ticker: order.asset.ticker,
        side: order.side,
        quantity,
        limitPrice,
        executedPrice: currentPrice,
      });
    }
  }

  return executedOrders;
}