const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    customerId: {
        type: String,
    },
    paymentIntentId: {
        type: String,
    },
    products: [],
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    shipping: {
        type: Object,
        required: true,
    },
    delivery_status: {
        type: String,
        default: "pending",
        enum: ["pending", "dispatched", "delivered", "canceled", "returned"], // Add new status options
    },
    payment_status: {
        type: String,
        required: true,
    },
    cancellation_status: {
        type: String,
        default: "pending",
        enum: ["pending", "accepted", "rejected"], // Add new cancellation status options
    },
    return_status: {
        type: String,
        default: "pending",
        enum: ["pending", "accepted", "rejected"], // Add new return status options
    },
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

exports.Order = Order;
