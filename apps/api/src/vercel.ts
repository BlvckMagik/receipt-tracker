import 'reflect-metadata';
import { config } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { json, urlencoded } from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { fileURLToPath } from 'url';

config();

let app: NestExpressApplication;

async function createApp() {
  if (!app) {
    app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
    app.use(json({ limit: '10mb' }));
    app.use(urlencoded({ extended: true }));
    app.use(cors());

    // Serve static files from web app (only if they exist)
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const webDistPath = join(__dirname, '../web/dist');
    
    try {
      const fs = await import('fs');
      if (fs.existsSync(webDistPath)) {
        app.useStaticAssets(webDistPath);
        app.setBaseViewsDir(webDistPath);
        
        // Catch-all handler for SPA
        app.use('*', (req: any, res: any) => {
          res.sendFile(join(webDistPath, 'index.html'));
        });
      }
    } catch (error) {
      console.log('Static files not found, serving API only');
    }
  }
  return app;
}

export default async function handler(req: any, res: any) {
  try {
    const nestApp = await createApp();
    const expressApp = nestApp.getHttpAdapter().getInstance();
    
    expressApp(req, res);
  } catch (error) {
    console.error('Error in Vercel handler:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
