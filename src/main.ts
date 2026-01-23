import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/http/http-exception.filter';
import { HttpLoggingInterceptor } from './shared/observability/http-logging.interceptor';
import { RequestIdMiddleware } from './shared/observability/request-id.middleware';
import { SeedService } from './shared/seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new HttpLoggingInterceptor());
  app.use(new RequestIdMiddleware().use);

  const config = new DocumentBuilder()
    .setTitle('Thmanyah Platform API')
    .setVersion('0.1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.get(SeedService).seedIfNeeded();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) => {
  // Ensure startup failures are visible in logs.
  console.error('Failed to bootstrap the application.', error);
  process.exit(1);
});
