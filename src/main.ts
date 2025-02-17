import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * https://www.youtube.com/watch?v=qA7RgCib8kE
 */

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
