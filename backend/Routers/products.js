import express from 'express';
const router = express.Router();
import { query } from '../database/database.js';
import { sendLowStockAlert } from '../services/EmailService.js';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';

router.get('/order/:userid', async (req, res) => {
    try {
        const {userid} = req.params;
        if (typeof userid !== 'string' || userid.length !== 28) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid user ID format' 
            });
        }
        const result = await query (
            `SELECT 
                products.name AS name,
                orders.total AS total,
                DATE(orders.created_at) as date,
                orders.status AS status
            FROM 
                orders
            INNER JOIN 
                products
            ON 
                orders.product_id = products.id
            WHERE
                orders.seller_id = $1`, [userid]
        )

        const sumQuery = await query(`
            SELECT 
                SUM(orders.total) AS total_sum
            FROM 
                orders
            WHERE
                orders.seller_id = $1 AND orders.status = 'pending'
        `, [userid]);

        const revenueQuery = await query(`
            SELECT 
                SUM(orders.total) AS total_sum
            FROM 
                orders
            WHERE
                orders.seller_id = $1 AND orders.status = 'delivered'
        `, [userid]);
        res.json({ 
            success: true, 
            order: result.rows, 
            totalSum: sumQuery.rows[0].total_sum || 0,
            revenueSum: revenueQuery.rows[0].total_sum || 0});
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
})

router.get('/dashboard/:userid', async (req, res) => {
    try {
        const {userid} = req.params;
        if (typeof userid !== 'string' || userid.length !== 28) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid user ID format' 
            });
        }
        const reviewResult = await query (
            `WITH score_series AS (
                SELECT generate_series(1, 5) AS review_score
            )
            SELECT 
                ss.review_score,
            COALESCE(COUNT(r.rating), 0) AS review_score_count
            FROM 
                score_series ss
            LEFT JOIN 
                reviews r
            ON 
                ss.review_score = r.rating
            LEFT JOIN 
                orders o 
            ON 
                o.id = r.order_id
                AND o.seller_id = $1
            GROUP BY 
                ss.review_score
            ORDER BY 
                ss.review_score`, [userid]
        )
        const revenueMonthQuery = await query (`
            WITH 
                month_series 
            AS (
            SELECT 
                generate_series(1, 12) AS month_number
            ),
            monthly_orders 
            AS (
            SELECT 
                EXTRACT(MONTH FROM created_at) AS month_number,
                COUNT(*) AS order_count,
                COALESCE(SUM(total), 0) AS monthly_revenue
            FROM 
                orders
            WHERE 
                created_at >= '2025-01-01' AND created_at < '2026-01-01'
		    AND 
                seller_id = $1
            GROUP BY 
                EXTRACT(MONTH FROM created_at)
            )
            SELECT 
                TO_CHAR(DATE '2025-01-01' + (ms.month_number - 1) * INTERVAL '1 month', 'Mon') AS month,
                COALESCE(mo.monthly_revenue, 0) AS monthly_revenue
            FROM 
                month_series ms
            LEFT JOIN 
                monthly_orders mo ON ms.month_number = mo.month_number
            ORDER BY 
                ms.month_number`,[userid])
        const categoryQuery = await query (`
            SELECT 
                category, count(category) 
            FROM
                products 
            LEFT JOIN 
                orders
            ON
                orders.product_id = products.id 
            WHERE 
                seller_id = $1
            GROUP BY category`,[userid])
        const orderStatusQuery = await query (
            `SELECT 
                status,
                count(status) as status_count
            FROM 
                orders
            WHERE
                orders.seller_id = $1
            GROUP BY 
                orders.status`, [userid]
        )
        const revenueQuery = await query(`
            SELECT 
                SUM(orders.total) AS total_sum
            FROM 
                orders
            WHERE
                orders.seller_id = $1 AND orders.status = 'delivered'
        `, [userid]);

        const uniqueUserQuery = await query(`
            SELECT 
                COUNT(DISTINCT orders.buyer_email) AS uniqueUsers
            FROM 
                orders
            WHERE
                orders.seller_id = $1
        `, [userid]);

        const itemsQuery = await query(`
            SELECT 
                COUNT(id) AS itemsCount
            FROM 
                products
            WHERE
                products.userid = $1
        `, [userid]);

        const completedOrdersQuery = await query(`
            SELECT 
                COUNT(orders.id) AS completedOrdersCount
            FROM 
                orders
            WHERE
                orders.seller_id = $1 AND status = 'delivered'
        `, [userid]);
        res.json({ 
            success: true, 
            orderStatus: orderStatusQuery.rows,
            review: reviewResult.rows,
            revenue: revenueQuery.rows[0].total_sum || 0,
            uniqueUsers: uniqueUserQuery.rows[0].uniqueusers || 0,
            itemsListed: itemsQuery.rows[0].itemscount || 0,
            category: categoryQuery.rows,
            revenueMonth:revenueMonthQuery.rows,
            completedOrders: completedOrdersQuery.rows[0].completedorderscount || 0});
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
})

router.get('/cartcount/:userid', async (req, res) => {
  try {
        const { userid } = req.params;
        if (typeof userid !== 'string' || userid.length !== 28) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid user ID format' 
            });
        }   
        const result = await query(`
            SELECT 
                COUNT(*) 
            FROM 
                cart 
            WHERE 
                userid = $1
        `, [userid]);
        res.json({ success: true, cart: result.rows[0].count || 0});
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

router.get('/cart/:userid', async (req, res) => {
  try {
        const { userid } = req.params;
        if (typeof userid !== 'string' || userid.length !== 28) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid user ID format' 
            });
        }   
        await query(`
            UPDATE cart 
            SET quantity = p.stock 
            FROM products p 
            WHERE cart.product_id = p.id 
            AND cart.quantity > p.stock
            `)
        const result = await query(`
            SELECT c.id AS cart_id, c.quantity AS cart_quantity, c.created_at AS added_at, p.*, 
            COALESCE(
                json_agg(
                json_build_object(
                    'id', pi.id,
                    'image_url', pi.image_url,
                    'is_primary', pi.is_primary
                ) 
                ORDER BY pi.is_primary DESC, pi.id
            ) FILTER (WHERE pi.id IS NOT NULL), 
            '[]'
            ) AS images
            FROM cart c
            JOIN products p ON c.product_id = p.id
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE c.userid = $1 AND c.quantity <= p.stock
            GROUP BY c.id, p.id
            ORDER BY c.created_at DESC;
        `, [userid]);
        res.json({ success: true, cart: result.rows });
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

router.put('/modify/:id', async (req, res) => {
    const { description, price, stock, id, low_stock_alert } = req.body;
    try {
        const queryText = `
        UPDATE products 
        SET 
            description = $1,
            price = $2,
            stock = $3,
            low_stock_alert = $4
        WHERE id = $5 
        RETURNING *`;
        
        const result = await query(queryText, 
            [description, price, stock, low_stock_alert || 0, id]);
        
        res.status(201).json({
            success: true,
            message: "Product updated successfully",
            product: result.rows[0]
        });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
        });
    }
});

router.put('/checkout/:id', async (req, res) => {
    const {stock, id} = req.body;
    try {
        const queryText= `
        UPDATE products 
        SET 
            stock = stock - $1
        WHERE id = $2
        RETURNING *`;
        const result = await query(queryText, 
            [stock, id]);
        res.status(201).json({
            success: true,
            message: "Product checked out successfully",
            product: result.rows[0]
        });
    } catch (error) {
        console.error("Error checking out:", error);
        res.status(500).json({
            success:false,
            message:'Error checking out',
        });
    }
})

router.post('/cart', async (req, res) => {
    const { userId, product, quantity } = req.body;

    try {
        await query('BEGIN');
        
        const productQuery = `
            INSERT INTO cart (userid, product_id, quantity)
            VALUES($1, $2, $3) 
            ON CONFLICT(userid, product_id)
            DO UPDATE SET quantity = cart.quantity + $3`;
        
        await query(productQuery,[userId,product,quantity]);

        await query('COMMIT');
        
        res.status(201).json({
            success: true,
            message: "Product added to cart successfully"
        });
    } catch (error) {
        await query("ROLLBACK");
        console.error("Error adding product to cart:", error);
        res.status(500).json({ success: false, message: "Failed to add product to cart" });
    }
});

router.post('/', async (req, res) => {
    const { name, userid, description, price, category, stock, images, low_stock_alert } = req.body;

    try {
        await query('BEGIN');
        
        const productQuery = `
            INSERT INTO products (name, userId, description, price, category, stock, low_stock_alert)
            VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id`;
        
        const productResult = await query(productQuery,
            [name, userid, description, price, category, stock, low_stock_alert || 0]
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

router.delete('/delete/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        console.log('Product ID:', productId);
        const queryTextProduct = `DELETE FROM products WHERE id = $1`;
        const queryTextImage = `DELETE FROM product_images WHERE product_id = $1`;
        const queryTextCart = `DELETE FROM cart WHERE product_id = $1`;
        await query(queryTextImage, [productId]);
        await query(queryTextProduct, [productId]);
        await query(queryTextCart, [productId]);
        res.status(200).json({
            success:true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({
            success:false,
            message:'Failed to delete product',
        });
    }
})

router.delete('/cart/:cartId', async (req, res) => {
    try {
        const { cartId } = req.params;
        const queryDelete = `DELETE FROM cart WHERE id = $1`;
        await query(queryDelete, [cartId]);
        res.status(200).json({
            success:true,
            message: 'Product deleted successfully from cart',
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({
            success:false,
            message:'Failed to delete product from cart',
        });
    }
})

export default router;

async function checkLowStock(productId) {
    try {
        // Get product info
        const productResult = await query('SELECT * FROM products WHERE id = $1', [productId]);
        const product = productResult.rows[0];
        
        if (!product) return;
        
        // Check if stock is low
        if (product.stock <= product.low_stock_alert && product.low_stock_alert > 0) {
            
            // Check if we already sent email today
            const emailCheck = await query(
                'SELECT * FROM low_stock_emails WHERE product_id = $1 AND email_sent_date = CURRENT_DATE',
                [productId]
            );
            
            if (emailCheck.rows.length > 0) {
                console.log('Email already sent today for product:', productId);
                return;
            }
            
            // Get user email from Firebase
            const userDoc = await getDoc(doc(db, "Users", product.userid));
            if (userDoc.exists()) {
                const userEmail = userDoc.data().email;
                const userName = userDoc.data().user;
                
                await sendLowStockAlert(
                    userEmail,
                    userName,
                    product.name,
                    product.stock,
                    product.low_stock_alert
                );
                
                await query(
                    'INSERT INTO low_stock_emails (product_id, user_id, email_sent_date) VALUES ($1, $2, CURRENT_DATE)',
                    [productId, product.userid]
                );
    
                console.log('Low stock email sent for product:', product.name);
            }
        }
    } catch (error) {
        console.error('Error checking low stock:', error);
    }
}

router.put('/checkout/:id', async (req, res) => {
    const { stock, id } = req.body;
    try {
        const queryText = `
        UPDATE products 
        SET 
            stock = stock - $1
        WHERE id = $2
        RETURNING *`;
        
        const result = await query(queryText, [stock, id]);
        
        // Check if stock is now low
        checkLowStock(id);
        
        res.status(201).json({
            success: true,
            message: "Product checked out successfully",
            product: result.rows[0]
        });
    } catch (error) {
        console.error("Error checking out:", error);
        res.status(500).json({
            success: false,
            message: 'Error checking out',
        });
    }
});