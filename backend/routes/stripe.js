require("dotenv").config();
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const { Order } = require('../models/order');
const router = express.Router();
const PDFDocument = require('pdfkit');
const nodemailer = require("nodemailer");
const fs = require('fs');
const path = require('path');


router.post("/create-checkout-session", async (req, res) => {
    try {
        const cartItems = req.body.cartItems.map((item) => ({
            id: item.id,
            cartQuantity: item.cartQuantity,
            name: item.name,
            description: item.desc,
            price: item.price * 100,
            taxRate: item.tax || 18,
            deliveryCharge: item.deliveryCharge * 100,
        }));

        const metadata = {
            userId: req.body.userId,
            cart: JSON.stringify(cartItems),
        };

        const customer = await stripe.customers.create({
            metadata,
        });

        const totalAmount = cartItems.reduce(
            (total, item) => ({
                price: total.price + item.price * item.cartQuantity,
                tax: total.tax + (item.price * item.cartQuantity * item.taxRate) / 100,
                deliveryCharge: total.deliveryCharge + item.deliveryCharge * item.cartQuantity,
            }),
            { price: 0, tax: 0, deliveryCharge: 0 }
        );

        const multipleDeliveryCharges = cartItems.some((item) => item.deliveryCharge > 0);

        const pricePromises = cartItems.map(async (item) => {
            const unitAmount = item.price + (item.price * item.taxRate) / 100;

            if (isNaN(unitAmount) || unitAmount < 0) {
                throw new Error("Invalid unit amount");
            }

            const price = await stripe.prices.create({
                product_data: {
                    name: item.name,
                    description: item.description,
                },
                unit_amount: Math.round(unitAmount),
                currency: "inr",
            });

            return price;
        });

        const prices = await Promise.all(pricePromises);

        const line_items = prices.map((price, index) => ({
            price: price.id,
            quantity: cartItems[index].cartQuantity,
        }));

        const shippingOptions = multipleDeliveryCharges
            ? [
                {
                    shipping_rate_data: {
                        type: "fixed_amount",
                        fixed_amount: {
                            amount: isNaN(totalAmount.deliveryCharge) ? 0 : totalAmount.deliveryCharge,
                            currency: "inr",
                        },
                        display_name: "Shipping",
                        delivery_estimate: {
                            minimum: {
                                unit: "business_day",
                                value: 5,
                            },
                            maximum: {
                                unit: "business_day",
                                value: 7,
                            },
                        },
                    },
                },
            ]
            : [
                {
                    shipping_rate_data: {
                        type: "fixed_amount",
                        fixed_amount: {
                            amount: 0,
                            currency: "inr",
                        },
                        display_name: "Free shipping",
                        delivery_estimate: {
                            minimum: {
                                unit: "business_day",
                                value: 5,
                            },
                            maximum: {
                                unit: "business_day",
                                value: 7,
                            },
                        },
                    },
                },
            ];

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            phone_number_collection: {
                enabled: true,
            },
            shipping_address_collection: {
                allowed_countries: ["US", "IN"],
            },
            shipping_options: shippingOptions,
            line_items,
            mode: "payment",
            customer: customer.id,
            success_url: `https://main--brilliant-cupcake-5560ea.netlify.app/checkout-success`,
            cancel_url: `https://main--brilliant-cupcake-5560ea.netlify.app/cart`,
        });

        res.json({ url: session.url, totalAmount });
    } catch (error) {
        console.error("Stripe Error:", error);
        res.status(500).json({ error: "An error occurred while creating the checkout session." });
    }
});


const createOrder = async (customer, data) => {
    const cartItems = JSON.parse(customer.metadata.cart);

    const orderProducts = cartItems.map((item) => {
        return {
            id: item._id,
            name: item.name,
            description: item.description,
            price: item.price,
            quantity: item.cartQuantity,
            taxRate: item.taxRate,
            deliveryCharge: item.deliveryCharge,
            image: item.images,
        };
    });

    const newOrder = new Order({
        userId: customer.metadata.userId,
        customerId: data.customer,
        paymentIntentId: data.payment_intent,
        products: orderProducts,
        subtotal: data.amount_subtotal,
        total: data.amount_total,
        shipping: data.customer_details,
        payment_status: data.payment_status,
    });

    try {
        const savedOrder = await newOrder.save();
        console.log("Processed Order:", savedOrder);
    } catch (err) {
        console.log(err);
    }
};


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: `${process.env.EMAIL_ID}`,
        pass: `${process.env.PASS_KEY}`
    }
});


async function sendInvoiceEmail(toMail, textContent, pdfPath) {
    try {
        const info = await transporter.sendMail({
            from: "iammanikandan.mannai@gmail.com",
            to: toMail,
            subject: `Thanks for Purchasing`,
            text: textContent,
            attachments: [
                {
                    filename: 'invoice.pdf',
                    path: pdfPath,
                    encoding: 'base64',
                },
            ],
        });

        console.log("Email sent successfully!", info.messageId);
        fs.unlinkSync(pdfPath);
        console.log("PDF file deleted successfully!");
    } catch (error) {
        console.error("Email sending failed:", error.message);
    }
}


router.post("/webhook", express.json(), async (req, res) => {
    const event = req.body;

    try {
        switch (event.type) {
            case "checkout.session.completed":
                const sessionID = event.data.object.id;
                const customer = await stripe.customers.retrieve(event.data.object.customer);
                const lineItems = await stripe.checkout.sessions.listLineItems(sessionID);

                createOrder(customer, event.data.object, lineItems.data);
                const invoice = {
                    customer: customer,
                    session: event.data.object,
                    lineItems: lineItems.data,
                };

                const textContent = generateTextInvoice(invoice);
                const pdfPath = await generatePdfInvoice(invoice);

                await sendInvoiceEmail(customer.email, textContent, pdfPath);

                break;
            case "payment_intent.succeeded":
            case "payment_method.attached":
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (err) {
        console.error(`Error handling Stripe webhook: ${err}`);
        return res.status(400).send("Webhook Error");
    }

    res.json({ received: true });
});

function generateTextInvoice(invoice) {
    const formatCurrency = (amount) => `₹${(amount / 100).toFixed(2)} INR`;

    const header = `Online Shopping\nThank You.\n\n`;
    const orderInfo = `Order ID: ${invoice.session.id}\nBill To: ${invoice.customer.email}\n` +
        `Order Date: ${new Date(invoice.session.created * 1000).toDateString()}\nSource: Online Shopping\n\n`;

    const orderDetailsHeader = `HERE'S WHAT YOU ORDERED:\n\n`;
    const orderDetailsBody = `Description\tPublisher\tPrice\n` +
        invoice.lineItems.map(lineItem =>
            `${lineItem.description}\t${lineItem.metadata && lineItem.metadata.publisher || ''}\t${formatCurrency(lineItem.amount_total)}`
        ).join('\n') + '\n\n';

    const total = `TOTAL:\t${formatCurrency(invoice.session.amount_total)}\n\n`;

    const note = `Please keep a copy of this receipt for your records.\n` +
        `View your purchase history\n` +
        `View your Online Shopping Rewards balance\n` +
        `Please note that unless otherwise stated, games purchased on Online Shopping are eligible for a refund within 14 days of purchase (or 14 days after release for pre-purchases) if they have been played for less than 2 hours. See our refund policy for more information.\n\n`;

    const footer = `Online Shopping Commerce GmbH\nYour Store Address\nGoods and Services Tax (GST) Registration Number: YourGSTNumber\n`;

    return header + orderInfo + orderDetailsHeader + orderDetailsBody + total + note + footer;
}

async function generatePdfInvoice(invoice, folderPath = 'invoice') {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }

    const filePath = path.join(folderPath, 'invoice.pdf');
    const doc = new PDFDocument();

    doc.font('Helvetica-Bold').fontSize(24).text('Epic Games', { align: 'center' });

    doc.strokeColor('#333333').lineWidth(2).moveTo(50, 80).lineTo(550, 80).stroke();

    doc.moveDown(1);
    doc.font('Helvetica').fontSize(12);
    doc.text(`Customer Name: ${invoice.customer.name}`);
    doc.text(`Email: ${invoice.customer.email}`);
    doc.text(`Order Date: ${new Date(invoice.session.created * 1000).toDateString()}`);
    doc.moveDown(1);

    doc.font('Helvetica-Bold').fontSize(16);
    doc.text('Invoice Summary', { align: 'left' });
    doc.moveDown(0.5);

    // Table header
    doc.font('Helvetica-Bold').fontSize(14);
    doc.text('Description', 50, doc.y, { width: 250, align: 'left' });
    doc.text('Publisher', 300, doc.y, { width: 100, align: 'left' });
    doc.text('Price', 400, doc.y, { width: 100, align: 'right' });

    doc.moveDown(0.5);

    // Table rows
    doc.font('Helvetica').fontSize(12);
    invoice.lineItems.forEach((lineItem) => {
        doc.text(lineItem.description, 50, doc.y, { width: 250, align: 'left' });
        const publisher = lineItem.metadata && lineItem.metadata.publisher ? lineItem.metadata.publisher : '';
        doc.text(publisher, 300, doc.y, { width: 100, align: 'left' });
        doc.text(`₹${(lineItem.amount_total / 100).toFixed(2)} INR`, 400, doc.y, { width: 100, align: 'right' });
        doc.moveDown(0.5);
    });

    // Total
    doc.moveDown(1);
    doc.font('Helvetica-Bold').text(`Total: ₹${(invoice.session.amount_total / 100).toFixed(2)} INR`, { align: 'right' });

    // Footer
    doc.moveDown(1);
    doc.font('Helvetica').fontSize(10).text('Thank you for your purchase!', { align: 'center' });

    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);
    doc.end();

    await new Promise((resolve) => writeStream.on('finish', resolve));

    return filePath;
}

module.exports = router;





