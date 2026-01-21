import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void): void {
    const existingId = req.header('x-request-id');
    const requestId =
      existingId && existingId.trim().length > 0 ? existingId : randomUUID();

    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  }
}
