import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

const PROGRAM_UPSERT_EVENT = 'program.upsert';
const PROGRAM_DELETE_EVENT = 'program.delete';

@Injectable()
export class SearchOutboxService {
  constructor(private readonly prisma: PrismaService) {}

  enqueueProgramUpsert(
    programId: string,
    payload: Prisma.JsonObject = {},
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.searchOutboxEvent.create({
      data: {
        type: PROGRAM_UPSERT_EVENT,
        entityId: programId,
        payload,
      },
    });
  }

  enqueueProgramDelete(
    programId: string,
    payload: Prisma.JsonObject = {},
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.searchOutboxEvent.create({
      data: {
        type: PROGRAM_DELETE_EVENT,
        entityId: programId,
        payload,
      },
    });
  }
}

export const SearchOutboxEventTypes = {
  PROGRAM_UPSERT_EVENT,
  PROGRAM_DELETE_EVENT,
} as const;
