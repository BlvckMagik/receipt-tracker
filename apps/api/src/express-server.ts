import express from 'express';
import cors from 'cors';
import { json, urlencoded } from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true }));

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

app.get('/api/receipts', (req, res) => {
  res.json({ receipts: [] });
});

app.post('/api/receipts/upload', (req, res) => {
  res.json({ message: 'Upload endpoint' });
});

// Serve static files from web app
const webDistPath = join(__dirname, '../web/dist');
app.use(express.static(webDistPath));

// Catch-all handler for SPA
app.get('*', (req, res) => {
  res.sendFile(join(webDistPath, 'index.html'));
});

export default app;
