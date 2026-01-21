import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = isHttpException ? exception.getResponse() : null;
    const error =
      isHttpException && typeof responseBody === 'object'
        ? (responseBody as { error?: string }).error
        : undefined;
    const message =
      isHttpException && typeof responseBody === 'object'
        ? (responseBody as { message?: string | string[] }).message
        : (exception as Error).message;

    response.status(status).json({
      statusCode: status,
      error: error ?? HttpStatus[status] ?? 'Error',
      message: message ?? 'Unexpected error',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
