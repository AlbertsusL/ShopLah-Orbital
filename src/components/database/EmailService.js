import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport(
  {
    secure:true,
    host:'smtp.gmail.com',
    port: 465,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
  }
);

export const sendEmailToSeller = async (orderInfo) => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 2);
    
    const emailContent = `
        <h2>New Order!</h2>
        <p>You got a new order:</p>
        <p><b>Buyer Name:</b> ${orderInfo.buyerName}</p>
        <p><b>Buyer Address:</b> ${orderInfo.buyerAddress}</p>
        <p><b>Buyer Contact Number:</b> ${orderInfo.buyerPhone}</p>
        <p><b>Buyer Email:</b> ${orderInfo.buyerEmail}</p>
        <p><b>Item Name:</b> ${orderInfo.productName}</p>
        <p><b>Quantity:</b> ${orderInfo.quantity}</p>
        <p><b>Deliver by:</b> ${deliveryDate.toDateString()}</p>
        <p>Please ship this item soon</p>
    `;

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: orderInfo.sellerEmail,
        subject: `New Order: ${orderInfo.productName}`,
        html: emailContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent to seller!');
    return result;
};

export const sendEmailToBuyer = async (orderInfo) => {
    const emailContent = `
        <h2>Order Confirmed!</h2>
        <p>Thanks for buying!</p>
        <p><b>Product:</b> ${orderInfo.productName}</p>
        <p><b>Quantity:</b> ${orderInfo.quantity}</p>
        <p><b>Total:</b> $${orderInfo.total}</p>
        <p>The seller will contact you soon!</p>
    `;

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: orderInfo.buyerEmail,
        subject: `Order Confirmed: ${orderInfo.productName}`,
        html: emailContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent to buyer!');
    return result;
};