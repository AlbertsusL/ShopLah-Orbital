import express from 'express';
const router = express.Router();
import { query } from '../../../../database.js';
import * as productController from '../Controller/productController.js';

router.get('/clients', productController.getProduct);
router.post('/',async(req, res) => {
    const {name, userid, description, price, category, stock, images} = req.body;

    try {
        await query('BEGIN');
        const productQuery = `
        INSERT INTO products (name, userId, description, price, category, stock)
        VALUES($1, $2, $3, $4, $5, $6) RETURNING id`;
        const productResult = await db.query(productQuery,
            [name, userid, description, price, category, stock]
        );
        const productId = productResult.rows[0].id;

        for (const[index, imageUrl] of images.entries()) {
            await query(
                'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3)',
                [productId, imageUrl, index===0]
            );
        }

        await query('COMMIT');
        
        res.status(201).json({
            message:"Product created successfully",
            productId
        });
    } catch (error) {
        await query("ROLLBACK");
        console.error("Error creating product:", error);
        res.status(500).json({message:"Failed to create product"})
    }
});

export default router;
