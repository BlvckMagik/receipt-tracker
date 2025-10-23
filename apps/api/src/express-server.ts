import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

// Catch-all handler for SPA
app.get('*', (req, res) => {
  res.json({ message: 'Receipt Tracker API', path: req.path });
});

export default app;
