import express from 'express';
import multer from 'multer';
const router = express.Router();
import uploadToCloud from '../cloudStorage/cloudStorage.js';
import { query } from '../../../../database.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }
});

router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    const uploadPromises = req.files.map(file => uploadToCloud(file))
    const imageUrls = await Promise.all(uploadPromises)
    const query = `
      INSERT INTO product_images (product_id, image_url, is_primary)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    
    const result = await query(query, [
      req.body.productId, 
      imageUrls, 
      req.body.isPrimary || false
    ]);
    
    res.json({
      success: true,
      imageId: result.rows[0].id,
      imageUrls
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to upload image' 
    });
  }
});

export default router;