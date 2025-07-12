import express from 'express';
import multer from 'multer';
const router = express.Router();
import uploadToCloud from '../services/cloudStorage/cloudStorage.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }
});

router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    
    const uploadPromises = req.files.map(file => uploadToCloud(file));
    const imageUrls = await Promise.all(uploadPromises);
    
    res.json({
      success: true,
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