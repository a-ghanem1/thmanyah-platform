-- CreateEnum
CREATE TYPE "SearchOutboxStatus" AS ENUM ('pending', 'processed', 'failed');

-- CreateTable
CREATE TABLE "SearchOutboxEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "SearchOutboxStatus" NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "SearchOutboxEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SearchOutboxEvent_status_createdAt_idx" ON "SearchOutboxEvent"("status", "createdAt");

-- CreateIndex
CREATE INDEX "SearchOutboxEvent_type_idx" ON "SearchOutboxEvent"("type");
