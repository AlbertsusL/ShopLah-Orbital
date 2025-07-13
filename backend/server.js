import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting EXPRESS server on port', PORT);

// Ultra-simple CORS
app.use(cors());
app.use(express.json());

// Immediate response routes
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Start server immediately
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ EXPRESS SERVER RUNNING ON PORT ${PORT}`);
});

// Prevent any shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM - ignoring...');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT - ignoring...');
});

console.log('🎯 Server setup complete');

export default app;