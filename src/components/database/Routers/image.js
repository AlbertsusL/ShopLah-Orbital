const express = require('express');
const multer = require('multer');
const router = express.Router();
const {uploadToCloud} = require('../cloudStorage');
const db = require('../../database');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }
});

router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image uploaded' });
    }
    const imageUrl = await uploadToCloud(req.file);
    const query = `
      INSERT INTO product_images (product_id, image_url, is_primary)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    
    const result = await db.query(query, [
      req.body.productId, 
      imageUrl, 
      req.body.isPrimary || false
    ]);
    
    res.json({
      success: true,
      imageId: result.rows[0].id,
      imageUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to upload image' 
    });
  }
});

module.exports = router;