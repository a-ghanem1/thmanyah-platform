import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect } from 'amqplib';
import type { Channel, ChannelModel, ConsumeMessage } from 'amqplib';
import { Env } from '../config/env.schema';

@Injectable()
export class RabbitMqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqService.name);
  private connection?: ChannelModel;
  private channel?: Channel;
  private readonly url: string;
  private readonly exchange: string;
  private readonly queue: string;

  constructor(private readonly configService: ConfigService<Env, true>) {
    this.url = this.configService.get('RABBITMQ_URL', { infer: true })!;
    this.exchange = this.configService.get('RABBITMQ_EXCHANGE', {
      infer: true,
    })!;
    this.queue = this.configService.get('RABBITMQ_QUEUE', { infer: true })!;
  }

  async onModuleInit(): Promise<void> {
    if (!this.url) {
      this.logger.warn('RABBITMQ_URL not set; RabbitMQ is disabled.');
      return;
    }

    const connection = await connect(this.url);
    const channel = await connection.createChannel();

    this.connection = connection;
    this.channel = channel;

    await channel.assertExchange(this.exchange, 'topic', { durable: true });
    await channel.assertQueue(this.queue, { durable: true });
    await channel.bindQueue(this.queue, this.exchange, '#');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }

  publish(routingKey: string, message: unknown): void {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not initialized.');
    }

    const payload = Buffer.from(JSON.stringify(message));
    this.channel.publish(this.exchange, routingKey, payload, {
      contentType: 'application/json',
      persistent: true,
    });
  }

  async consume(
    handler: (payload: unknown, raw: ConsumeMessage) => Promise<void>,
  ): Promise<void> {
    if (!this.channel) {
      return;
    }

    await this.channel.consume(this.queue, (message) => {
      if (!message) {
        return;
      }

      let payload: unknown;
      try {
        payload = JSON.parse(message.content.toString('utf-8')) as unknown;
      } catch (error) {
        this.logger.warn(
          `Failed to parse message: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        this.channel?.nack(message, false, false);
        return;
      }

      void handler(payload, message)
        .then(() => {
          this.channel?.ack(message);
        })
        .catch((error) => {
          this.logger.warn(
            `Failed to handle message: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          this.channel?.nack(message, false, false);
        });
    });
  }

  isReady(): boolean {
    return Boolean(this.channel);
  }
}
