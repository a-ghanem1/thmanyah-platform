import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  type HealthIndicatorResult,
  HttpHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Env } from '../config/env.schema';
import { PrismaService } from '../database/prisma.service';
import { RedisHealthIndicator } from './redis.health';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly httpHealth: HttpHealthIndicator,
    private readonly redisHealth: RedisHealthIndicator,
    private readonly configService: ConfigService<Env, true>,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Liveness check' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  liveness(): Promise<HealthCheckResult> {
    return this.health.check([() => this.uptimeIndicator()]);
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness check' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Dependency unavailable' })
  readiness(): Promise<HealthCheckResult> {
    const meiliHost = this.configService.get('MEILI_HOST', { infer: true });
    const redisUrl = this.configService.get('REDIS_URL', { infer: true });

    return this.health.check([
      () => this.uptimeIndicator(),
      () => this.prismaHealth.pingCheck('postgres', this.prismaService),
      () => this.httpHealth.pingCheck('meilisearch', `${meiliHost}/health`),
      () => this.checkRedis(redisUrl),
    ]);
  }

  private uptimeIndicator(): HealthIndicatorResult {
    return {
      uptime: {
        status: 'up',
        seconds: Math.floor(process.uptime()),
      },
    };
  }

  private async checkRedis(redisUrl?: string): Promise<HealthIndicatorResult> {
    if (!redisUrl) {
      return { redis: { status: 'up', message: 'REDIS_URL not set' } };
    }

    return await this.redisHealth.pingCheck('redis', { url: redisUrl });
  }
}
