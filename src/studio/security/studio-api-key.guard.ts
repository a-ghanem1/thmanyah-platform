import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class StudioApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const providedKey = request.headers['x-studio-api-key'];
    const expectedKey = process.env.STUDIO_API_KEY;

    if (!expectedKey || providedKey !== expectedKey) {
      throw new UnauthorizedException('Invalid studio API key');
    }

    return true;
  }
}
