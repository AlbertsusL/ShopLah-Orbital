import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './Routers/products.js';
import imageRoutes from './Routers/image.js';
import ordersRouter from './Routers/orders.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🔧 Starting server with configuration:');
console.log('📍 Port:', PORT);
console.log('🌏 AWS Region:', process.env.AWS_REGION);
console.log('🔗 Database Host:', process.env.PG_HOST);
console.log('🔗 Frontend URL:', process.env.FRONTEND_URL);

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

console.log('🔒 CORS origins configured:', corsOptions.origin);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection on startup
import pool from './database/database.js';
pool.query('SELECT NOW()', [])
  .then(result => {
    console.log('✅ Database connected successfully:', result.rows[0]);
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

// Routes
app.use('/api/products', productRoutes);
app.use('/api/upload', imageRoutes);
app.use('/api/orders', ordersRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'ShopLah API is running!',
    storage: 'AWS S3',
    region: process.env.AWS_REGION || 'Not configured',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Error handling
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`☁️ Using AWS S3 for image storage`);
  console.log(`🌏 AWS Region: ${process.env.AWS_REGION || 'Not configured'}`);
  console.log(`✅ Server successfully started at ${new Date().toISOString()}`);
});

export default app;