-- CreateTable
CREATE TABLE "portfolio_snapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cashBalance" DECIMAL(18,2) NOT NULL,
    "portfolioValue" DECIMAL(18,2) NOT NULL,
    "totalValue" DECIMAL(18,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "portfolio_snapshot_userId_idx" ON "portfolio_snapshot"("userId");

-- AddForeignKey
ALTER TABLE "portfolio_snapshot" ADD CONSTRAINT "portfolio_snapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
