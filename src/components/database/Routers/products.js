import express from 'express';
const router = express.Router();
import { query } from '../database.js';

router.get('/user/:userid', async (req, res) => {
  try {
        const { userid } = req.params;
        if (typeof userid !== 'string' || userid.length !== 28) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid user ID format' 
            });
    }   
        const result = await query(`
            SELECT p.*, 
                   COALESCE(
                     json_agg(
                       json_build_object(
                         'id', pi.id,
                         'image_url', pi.image_url,
                         'is_primary', pi.is_primary
                       ) ORDER BY pi.is_primary DESC, pi.id
                     ) FILTER (WHERE pi.id IS NOT NULL), 
                     '[]'
                   ) as images
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE p.userid = $1
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `, [userid]);
        res.json({ success: true, products: result.rows });
    } catch (error) {
        console.error('Database error:', {
        message: error.message,
        query: error.query,
        parameters: error.parameters
    });
    res.status(500).json({ 
        success: false, 
        message: 'Database operation failed',
        error: error.message 
    });
  }
});


router.get('/', async (req, res) => {
    try {
        const queryText = `
            SELECT p.*, 
                   COALESCE(
                     json_agg(
                       json_build_object(
                         'id', pi.id,
                         'image_url', pi.image_url,
                         'is_primary', pi.is_primary
                       ) ORDER BY pi.is_primary DESC, pi.id
                     ) FILTER (WHERE pi.id IS NOT NULL), 
                     '[]'
                   ) as images
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `;
        
        const result = await query(queryText);
        res.json({ success: true, products: result.rows });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const queryText = `
            SELECT p.*, 
                   COALESCE(
                     json_agg(
                       json_build_object(
                         'id', pi.id,
                         'image_url', pi.image_url,
                         'is_primary', pi.is_primary
                       ) ORDER BY pi.is_primary DESC, pi.id
                     ) FILTER (WHERE pi.id IS NOT NULL), 
                     '[]'
                   ) as images
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE p.id = $1
            GROUP BY p.id
        `;

        const result = await query(queryText, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({ success: true, product: result.rows[0] });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch product' });
    }
});

router.post('/', async (req, res) => {
    const { name, userid, description, price, category, stock, images } = req.body;

    try {
        await query('BEGIN');
        
        const productQuery = `
            INSERT INTO products (name, userId, description, price, category, stock)
            VALUES($1, $2, $3, $4, $5, $6) RETURNING id`;
        
        const productResult = await query(productQuery,
            [name, userid, description, price, category, stock]
        );
        
        const productId = productResult.rows[0].id;

        if (images && images.length > 0) {
            for (const [index, imageUrl] of images.entries()) {
                await query(
                    'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3)',
                    [productId, imageUrl, index === 0]
                );
            }
        }

        await query('COMMIT');
        
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            productId
        });
    } catch (error) {
        await query("ROLLBACK");
        console.error("Error creating product:", error);
        res.status(500).json({ success: false, message: "Failed to create product" });
    }
});

export default router;