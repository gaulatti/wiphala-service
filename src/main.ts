import { Logger } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { AuthorizationGuard } from './authorization/authorization.guard';
import { logger } from './utils/logger';

/**
 * Sets the logger for the application to the JsonLogger.
 */
Logger.overrideLogger(logger);

/**
 * https://www.youtube.com/watch?v=qA7RgCib8kE
 */

async function bootstrap() {
  /**
   * Creates an instance of the NestJS application using the Fastify adapter.
   */
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  /**
   * Enables Cross-Origin Resource Sharing (CORS) for the application.
   */
  app.enableCors();

  /**
   * Sets the global guard for the application to the AuthorizationGuard.
   */
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new AuthorizationGuard(reflector));

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
