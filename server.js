import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './src/components/database/Routers/products.js';
import imageRoutes from './src/components/database/Routers/image.js';
import ordersRouter from './src/components/database/Routers/orders.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    region: process.env.AWS_REGION || 'Not configured'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`☁️ Using AWS S3 for image storage`);
  console.log(`🌏 AWS Region: ${process.env.AWS_REGION || 'Not configured'}`);
});

export default app;