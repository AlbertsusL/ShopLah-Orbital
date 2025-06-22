import express from 'express';
const router = express.Router();
import { query } from '../database.js';
import { sendEmailToSeller, sendEmailToBuyer } from '../EmailService.js';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase.js';
import dotenv from 'dotenv';
dotenv.config();

import {Stripe} from "stripe";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create new order (existing route)
router.post('/', async (req, res) => {
    const {productId,
          quantity,
          total,
          buyerName,
          buyerEmail,
          buyerAddress,
          buyerPhone,
          sellerId} = req.body;

    // Get Product Info
    const productResult = await query('SELECT * FROM products WHERE id = $1', [productId]);
    const product = productResult.rows[0];

    // Check if enough stock
    if (product.stock < quantity) {
        return res.json({ success: false, message: 'Not enough stock' });
    }

    // Reduce Stock
    await query('UPDATE products SET stock = stock - $1 WHERE id = $2', [quantity, productId]);

    // Store order
    const orderQuery = `
        INSERT INTO orders (product_id, seller_id, buyer_name, buyer_email, buyer_address, buyer_phone, quantity, total, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING id
    `;
    
    const orderResult = await query(orderQuery, [
        productId,
        sellerId,
        buyerName,
        buyerEmail,
        buyerAddress,
        buyerPhone,
        quantity,
        total,
        'pending'
    ]);

    const orderId = orderResult.rows[0].id;

    let sellerEmail = 'testing@gmail.com';

    try {
        const sellerDoc = await getDoc(doc(db, "Users", product.userid));
        if (sellerDoc.exists()) {
            sellerEmail = sellerDoc.data().email;
            console.log('Found seller email:', sellerEmail);
        } else {
            console.log('Seller not found in Firebase, using default email');
        }
    } catch (error) {
        console.log('Error getting seller email:', error);
    }

    // Send Emails
    const emailInfo = {
        buyerName: buyerName,
        buyerEmail: buyerEmail,
        buyerAddress: buyerAddress,
        buyerPhone: buyerPhone,
        productName: product.name,
        quantity: quantity,
        total: total,
        sellerEmail: sellerEmail
    };

    sendEmailToSeller(emailInfo);
    sendEmailToBuyer(emailInfo);

    res.json({
        success: true,
        message: 'Order placed',
        orderId: orderId
    });
});

// Get orders for a specific buyer
router.get('/buyer/:buyerEmail', async (req, res) => {
    try {
        const { buyerEmail } = req.params;
        
        const queryText = `
            SELECT 
                o.*,
                p.name as product_name,
                p.price as product_price
            FROM orders o
            JOIN products p ON o.product_id = p.id
            WHERE o.buyer_email = $1
            ORDER BY o.created_at DESC
        `;
        
        const result = await query(queryText, [buyerEmail]);
        
        res.json({ 
            success: true, 
            orders: result.rows 
        });
    } catch (error) {
        console.error('Error fetching buyer orders:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch orders',
            error: error.message 
        });
    }
});

// Update order status
router.put('/:orderId/status', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        
        // Validate status
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }
        
        const queryText = `
            UPDATE orders 
            SET status = $1
            WHERE id = $2
            RETURNING *
        `;
        
        const result = await query(queryText, [status, orderId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Order status updated successfully',
            order: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
});

// Get order by ID
router.get('/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const queryText = `
            SELECT 
                o.*,
                p.name as product_name,
                p.price as product_price,
                p.category as product_category
            FROM orders o
            JOIN products p ON o.product_id = p.id
            WHERE o.id = $1
        `;
        
        const result = await query(queryText, [orderId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        res.json({
            success: true,
            order: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
            error: error.message
        });
    }
});

router.post("/create-payment-intent", async (req, res) => {
  const { total } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total * 100, // Convert to cents
      currency: "sgd",
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).send("Payment failed");
  }
});
export default router;