import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, SearchOutboxStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { RabbitMqService } from '../messaging/rabbitmq.service';
import { SearchOutboxMessage } from './outbox.event';

const DEFAULT_BATCH_SIZE = 25;
const DEFAULT_INTERVAL_MS = 2000;
const DEFAULT_RETRY_BASE_SEC = 5;
const DEFAULT_LEASE_SEC = 60;

@Injectable()
export class SearchOutboxRelay implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SearchOutboxRelay.name);
  private intervalId?: NodeJS.Timeout;
  private isRunning = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbit: RabbitMqService,
  ) {}

  onModuleInit() {
    this.intervalId = setInterval(() => {
      void this.processBatch();
    }, DEFAULT_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private async processBatch() {
    if (this.isRunning) {
      return;
    }
    if (!this.rabbit.isReady()) {
      return;
    }
    this.isRunning = true;

    try {
      const events = await this.claimBatch(DEFAULT_BATCH_SIZE);
      for (const event of events) {
        try {
          this.publishEvent(event);
          await this.prisma.searchOutboxEvent.update({
            where: { id: event.id },
            data: {
              status: SearchOutboxStatus.PUBLISHED,
              processedAt: new Date(),
              lastError: null,
            },
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          const attempts = event.attempts + 1;
          await this.prisma.searchOutboxEvent.update({
            where: { id: event.id },
            data: {
              status: SearchOutboxStatus.FAILED,
              attempts,
              lastError: message,
              nextAttemptAt: this.computeNextAttempt(attempts),
            },
          });
          this.logger.warn(
            `Failed to publish outbox event ${event.id}: ${message}.`,
          );
        }
      }
    } finally {
      this.isRunning = false;
    }
  }

  private async claimBatch(limit: number) {
    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const leaseUntil = new Date(now.getTime() + DEFAULT_LEASE_SEC * 1000);
      const rows = await tx.$queryRaw<
        Array<{
          id: string;
          type: string;
          entityId: string;
          payload: Prisma.JsonValue;
          attempts: number;
          createdAt: Date;
        }>
      >`
        UPDATE "SearchOutboxEvent"
        SET "nextAttemptAt" = ${leaseUntil}
        WHERE "id" IN (
          SELECT "id"
          FROM "SearchOutboxEvent"
          WHERE "status" IN (
            CAST(${SearchOutboxStatus.PENDING} AS "SearchOutboxStatus"),
            CAST(${SearchOutboxStatus.FAILED} AS "SearchOutboxStatus")
          )
            AND "nextAttemptAt" <= ${now}
          ORDER BY "createdAt" ASC
          FOR UPDATE SKIP LOCKED
          LIMIT ${limit}
        )
        RETURNING "id", "type", "entityId", "payload", "attempts", "createdAt";
      `;

      return rows;
    });
  }

  private publishEvent(event: {
    id: string;
    type: string;
    entityId: string;
    payload: Prisma.JsonValue;
    createdAt: Date;
  }) {
    const message: SearchOutboxMessage = {
      eventId: event.id,
      type: event.type,
      entityId: event.entityId,
      payload:
        typeof event.payload === 'object' && event.payload
          ? (event.payload as Record<string, unknown>)
          : {},
      occurredAt: event.createdAt.toISOString(),
    };

    this.rabbit.publish(event.type, message);
  }

  private computeNextAttempt(attempts: number): Date {
    const delaySec = Math.min(
      DEFAULT_RETRY_BASE_SEC * Math.pow(2, attempts),
      300,
    );
    return new Date(Date.now() + delaySec * 1000);
  }
}
