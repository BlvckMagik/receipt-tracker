import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { json, urlencoded } from 'express';
import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true }));
  app.use(cors());

  await app.listen(3001);
  console.log('API listening on http://localhost:3001');
}
bootstrap();
