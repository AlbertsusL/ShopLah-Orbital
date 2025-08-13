import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './Routers/products.js';
import imageRoutes from './Routers/image.js';
import ordersRouter from './Routers/orders.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting server with configuration:');
console.log('Port:', PORT);
console.log('AWS Region:', process.env.AWS_REGION);
console.log('Database connection method:', process.env.DATABASE_URL ? 'DATABASE_URL' : 'Individual variables');

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
    'https://shop-lah-test.vercel.app'
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};


// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection on startup
import { query } from './database/database.js';
query('SELECT NOW()', [])
  .then(result => {
    console.log('✅ Database connected successfully:', result.rows[0]);
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

// Root route
app.get('/', (req, res) => {
  res.send('ShopLah API is running');
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/upload', imageRoutes);
app.use('/api/orders', ordersRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Using AWS S3 for image storage`);
  console.log(`✅ AWS Region: ${process.env.AWS_REGION || 'Not configured'}`);
});

export default app;