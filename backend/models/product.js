const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        brand: { type: String, required: true },
        desc: { type: String, required: true },
        price: { type: Number, required: true },
        images: [
            {
                public_id: String,
                url: String,
            },
        ],
        tax: { type: Number },
        deliveryCharge: { type: Number },
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

exports.Product = Product;
