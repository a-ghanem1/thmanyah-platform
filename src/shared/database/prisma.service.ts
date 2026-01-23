import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { readReplicas } from '@prisma/extension-read-replicas';

function parseReplicaUrls(value?: string): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
    const replicaUrls = parseReplicaUrls(process.env.DATABASE_REPLICA_URLS);
    if (replicaUrls.length > 0) {
      const replicas = replicaUrls.map(
        (datasourceUrl) => new PrismaClient({ datasourceUrl }),
      );
      return this.$extends(
        readReplicas({ replicas }),
      ) as unknown as PrismaService;
    }
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
