import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { SearchOutboxStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { MeiliService } from './meili.service';
import { SearchOutboxEventTypes } from './outbox.service';

const DEFAULT_BATCH_SIZE = 20;
const DEFAULT_INTERVAL_MS = 5000;

@Injectable()
export class SearchOutboxWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SearchOutboxWorker.name);
  private intervalId?: NodeJS.Timeout;
  private isRunning = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly meiliService: MeiliService,
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
    this.isRunning = true;

    try {
      const events = await this.prisma.searchOutboxEvent.findMany({
        where: {
          status: {
            in: [SearchOutboxStatus.pending, SearchOutboxStatus.failed],
          },
        },
        orderBy: { createdAt: 'asc' },
        take: DEFAULT_BATCH_SIZE,
      });

      for (const event of events) {
        const requestId = this.getRequestId(event.payload);
        const requestTag = requestId ? ` requestId=${requestId}` : '';
        try {
          if (event.type === SearchOutboxEventTypes.PROGRAM_UPSERT_EVENT) {
            const program = await this.prisma.program.findUnique({
              where: { id: event.entityId },
              include: { categories: { include: { category: true } } },
            });
            if (program) {
              await this.meiliService.syncProgram(program);
            } else {
              await this.meiliService.removeProgram(event.entityId);
            }
          } else if (
            event.type === SearchOutboxEventTypes.PROGRAM_DELETE_EVENT
          ) {
            await this.meiliService.removeProgram(event.entityId);
          } else {
            this.logger.warn(
              `Unknown outbox event type ${event.type} for ${event.id}.${requestTag}`,
            );
          }

          await this.prisma.searchOutboxEvent.update({
            where: { id: event.id },
            data: {
              status: SearchOutboxStatus.processed,
              processedAt: new Date(),
              lastError: null,
            },
          });

          this.logger.log(
            `Processed outbox event ${event.id} (${event.type}).${requestTag}`,
          );
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          await this.prisma.searchOutboxEvent.update({
            where: { id: event.id },
            data: {
              status: SearchOutboxStatus.failed,
              attempts: { increment: 1 },
              lastError: message,
            },
          });

          this.logger.warn(
            `Failed outbox event ${event.id} (${event.type}): ${message}.${requestTag}`,
          );
        }
      }
    } finally {
      this.isRunning = false;
    }
  }

  private getRequestId(payload: unknown): string | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const record = payload as Record<string, unknown>;
    const requestId = record.requestId;
    if (typeof requestId === 'string' && requestId.length > 0) {
      return requestId;
    }

    return null;
  }
}
