import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Env } from '../config/env.schema';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly redis?: Redis;
  private readonly defaultTtlSec = 60;

  constructor(private readonly configService: ConfigService<Env, true>) {
    const redisUrl = this.configService.get('REDIS_URL', { infer: true });
    if (redisUrl) {
      this.redis = new Redis(redisUrl);
    } else {
      this.logger.warn('REDIS_URL is not set; cache is disabled.');
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  async getOrSet<T>(
    key: string,
    ttlSec: number = this.defaultTtlSec,
    fn: () => Promise<T>,
  ): Promise<T> {
    if (!this.redis) {
      return fn();
    }

    try {
      const cached = await this.redis.get(key);
      if (cached !== null) {
        return JSON.parse(cached) as T;
      }
    } catch (error) {
      this.logger.warn(
        `Cache get failed for ${key}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    const value = await fn();

    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttlSec);
    } catch (error) {
      this.logger.warn(
        `Cache set failed for ${key}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return value;
  }

  buildKey(route: string, params?: Record<string, unknown>): string {
    const normalized = this.normalizeParams(params);
    return normalized ? `${route}?${normalized}` : route;
  }

  private normalizeParams(params?: Record<string, unknown>): string {
    if (!params) {
      return '';
    }

    const entries: Array<[string, string]> = [];
    const keys = Object.keys(params).sort();

    for (const key of keys) {
      const value = params[key];
      if (value === undefined || value === null) {
        continue;
      }

      if (Array.isArray(value)) {
        const normalizedValues = value
          .map((item) => this.normalizeValue(item))
          .filter((item) => item !== '')
          .sort();

        for (const item of normalizedValues) {
          entries.push([key, item]);
        }
        continue;
      }

      const normalizedValue = this.normalizeValue(value);
      if (normalizedValue !== '') {
        entries.push([key, normalizedValue]);
      }
    }

    return entries
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join('&');
  }

  private normalizeValue(value: unknown): string {
    if (value === undefined || value === null) {
      return '';
    }

    if (typeof value === 'object') {
      return this.stableStringify(value);
    }

    return String(value);
  }

  private stableStringify(value: unknown): string {
    if (value === undefined || value === null) {
      return '';
    }

    if (Array.isArray(value)) {
      return `[${value.map((item) => this.stableStringify(item)).join(',')}]`;
    }

    if (typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const keys = Object.keys(record).sort();
      return `{${keys
        .map((key) => `${key}:${this.stableStringify(record[key])}`)
        .join(',')}}`;
    }

    return String(value);
  }
}
