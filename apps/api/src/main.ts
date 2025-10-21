import 'reflect-metadata';
import { config } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { json, urlencoded } from 'express';
import cors from 'cors';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true }));
  app.use(cors());

  // Serve static files from web app
  app.useStaticAssets(join(__dirname, '../web/dist'));
  app.setBaseViewsDir(join(__dirname, '../web/dist'));
  
  // Catch-all handler for SPA
  app.use('*', (req: any, res: any) => {
    res.sendFile(join(__dirname, '../web/dist/index.html'));
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`API listening on port ${port}`);
}
bootstrap();
