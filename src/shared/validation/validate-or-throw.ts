import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

type ClassType<T> = new (...args: unknown[]) => T;

export async function validateOrThrow<T>(
  type: ClassType<T>,
  value: unknown,
): Promise<T> {
  const instance = plainToInstance(type, value);
  const errors = await validate(instance as object, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  if (errors.length > 0) {
    const messages = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .filter((message) => message.length > 0);
    throw new BadRequestException(
      messages.length > 0 ? messages.join('; ') : 'Validation failed',
    );
  }
  return instance;
}
