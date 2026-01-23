import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { RabbitMqService } from '../messaging/rabbitmq.service';
import { SearchOutboxEventTypes } from './outbox.service';
import { SearchOutboxMessage } from './outbox.event';
import { MeiliService } from './meili.service';

type PrismaWithPrimary = PrismaService & {
  $primary?: () => PrismaClient;
};

@Injectable()
export class SearchIndexerConsumer implements OnModuleInit {
  private readonly logger = new Logger(SearchIndexerConsumer.name);

  constructor(
    private readonly rabbit: RabbitMqService,
    private readonly prisma: PrismaService,
    private readonly meiliService: MeiliService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.rabbit.consume((payload) => this.handleMessage(payload));
  }

  private async handleMessage(payload: unknown): Promise<void> {
    const message = payload as SearchOutboxMessage;
    if (!message?.type || !message?.entityId) {
      this.logger.warn('Ignoring invalid search message payload.');
      return;
    }

    if (message.type === SearchOutboxEventTypes.PROGRAM_UPSERT_EVENT) {
      const db = this.getPrimaryClient();
      const program = await db.program.findUnique({
        where: { id: message.entityId },
        include: { categories: { include: { category: true } } },
      });
      if (program) {
        await this.meiliService.syncProgram(program);
      } else {
        await this.meiliService.removeProgram(message.entityId);
      }
      return;
    }

    if (message.type === SearchOutboxEventTypes.PROGRAM_DELETE_EVENT) {
      await this.meiliService.removeProgram(message.entityId);
      return;
    }

    this.logger.warn(`Unknown search event type: ${message.type}`);
  }

  private getPrimaryClient(): PrismaClient {
    const prisma = this.prisma as PrismaWithPrimary;
    return prisma.$primary ? prisma.$primary() : this.prisma;
  }
}
