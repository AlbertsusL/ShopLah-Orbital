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

router.post('/', async (req, res) => {
    const {productId,
          quantity,
          total,
          buyerName,
          buyerEmail,
          buyerAddress,
          buyerPhone,
          sellerId} = req.body;

    {/* Get Product Info */}
    const productResult = await query('SELECT * FROM products WHERE id = $1', [productId]);
    const product = productResult.rows[0];

    {/* Check if enough stock */}
    if (product.stock < quantity) {
        return res.json({ success: false, message: 'Not enough stock' });
    }

    {/* Reduce Stock */}
    await query('UPDATE products SET stock = stock - $1 WHERE id = $2', [quantity, productId]);

    {/* Store order */}
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

    {/* Send Emails */}
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