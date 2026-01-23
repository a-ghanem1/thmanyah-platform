-- Update outbox status enum and add retry scheduling fields
ALTER TYPE "SearchOutboxStatus" RENAME TO "SearchOutboxStatus_old";

CREATE TYPE "SearchOutboxStatus" AS ENUM ('PENDING', 'PUBLISHED', 'FAILED');

ALTER TABLE "SearchOutboxEvent"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "SearchOutboxStatus"
    USING (CASE
      WHEN "status" = 'pending' THEN 'PENDING'::"SearchOutboxStatus"
      WHEN "status" = 'processed' THEN 'PUBLISHED'::"SearchOutboxStatus"
      WHEN "status" = 'failed' THEN 'FAILED'::"SearchOutboxStatus"
    END),
  ALTER COLUMN "status" SET DEFAULT 'PENDING';

ALTER TABLE "SearchOutboxEvent"
  ADD COLUMN "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "SearchOutboxEvent_status_nextAttemptAt_idx" ON "SearchOutboxEvent"("status", "nextAttemptAt");

DROP TYPE "SearchOutboxStatus_old";
