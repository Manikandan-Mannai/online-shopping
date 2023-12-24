const mongoose = require("mongoose");
const { Product } = require("../models/product");
const { isAdmin } = require("../middleware/auth");
const cloudinary = require("../utils/cloudinary");
const router = require("express").Router();

router.post("/", isAdmin, async (req, res) => {
    const { name, brand, desc, price, images, tax, deliveryCharge } = req.body;

    try {
        if (price === undefined) {
            return res.status(400).send("Price is required for the product.");
        }

        if (images && images.length > 0) {
            const uploadedImages = await Promise.all(
                images.map(async (image) => {
                    const uploadedResponse = await cloudinary.uploader.upload(image, {
                        folder: "online-shop",
                    });
                    return {
                        public_id: uploadedResponse.public_id,
                        url: uploadedResponse.secure_url,
                    };
                })
            );

            const productData = {
                name,
                brand,
                desc,
                price,
                images: uploadedImages,
                tax,
                deliveryCharge,
            };

            if (deliveryCharge !== undefined) {
                productData.deliveryCharge = deliveryCharge;
            }

            const product = new Product(productData);

            const savedProduct = await product.save();
            res.status(200).send(savedProduct);
        } else {
            res.status(400).send("Images are required for the product.");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.get("/", async (req, res) => {
    const qbrand = req.query.brand;
    try {
        let products;

        if (qbrand) {
            products = await Product.find({
                brand: qbrand,
            });
        } else {
            products = await Product.find();
        }

        res.status(200).send(products);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get("/find/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.status(200).send(product);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.delete("/:id", isAdmin, async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).send("Product not found");
        }

        if (product.images && product.images.length > 0) {
            await Promise.all(
                product.images.map(async (image) => {
                    const destroyResponse = await cloudinary.uploader.destroy(image.public_id);
                    if (!destroyResponse) {
                        console.log(`Failed to delete image from Cloudinary: ${image.public_id}`);
                    }
                })
            );
        }

        const deletedProduct = await Product.findByIdAndDelete(productId);

        res.status(200).send(deletedProduct);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message || "Internal Server Error");
    }
});


router.put('/:id', isAdmin, async (req, res) => {
    try {
        const productId = req.params.id;

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send({ message: 'Invalid product ID' });
        }

        let updatedProduct;

        if (req.body.productImg && Array.isArray(req.body.productImg)) {
            const uploadedImages = await Promise.all(
                req.body.productImg.map(async (image) => {
                    const uploadedResponse = await cloudinary.uploader.upload(image, {
                        upload_preset: 'online-shop',
                    });
                    return {
                        public_id: uploadedResponse.public_id,
                        url: uploadedResponse.secure_url,
                    };
                })
            );

            updatedProduct = await Product.findByIdAndUpdate(
                productId,
                {
                    $set: {
                        ...req.body.product,
                        images: uploadedImages,
                    },
                },
                { new: true }
            );
        } else {
            updatedProduct = await Product.findByIdAndUpdate(
                productId,
                {
                    $set: req.body.product,
                },
                { new: true }
            );
        }

        if (!updatedProduct || !updatedProduct._id) {
            return res.status(400).send({ message: 'Invalid product data received. Update failed.' });
        }

        res.status(200).send(updatedProduct);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

module.exports = router;
