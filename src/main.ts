import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      enableDebugMessages: true,
    }),
  );

  app.enableCors({
    origin: 'http://localhost:5173',
  });

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
}

void bootstrap();
