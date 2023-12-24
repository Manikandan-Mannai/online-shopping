const { Order } = require("../models/order");
const { auth, isAdmin } = require("../middleware/auth");
const moment = require("moment");
const router = require("express").Router();

// GET ORDERS
router.get('/', isAdmin, async (req, res) => {
    const query = req.query.new;
    try {
        const orders = query
            ? await Order.find().sort({ _id: -1 }).limit(4)
            : await Order.find().sort({ id: -1 });
        res.status(200).send(orders);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

// GET USER ORDERS
router.get('/user', auth, async (req, res) => {
    try {
        const userId = req.user._id; // Get the user's ID from the authenticated user
        const orders = await Order.find({ userId }).sort({ _id: -1 });
        res.status(200).send(orders);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});


// UPDATE ORDER
router.put("/:id", isAdmin, async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).send(updatedOrder);
    } catch (err) {
        res.status(500).send(err);
    }
});

// GET AN ORDER
router.get("/findone/:id", auth, async (req, res) => {
    try {

        if (!req.user || !req.user.isAdmin) {
            return res.status(403).send("Access denied. Not authorized...");
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).send("Order not found");
        }

        res.status(200).send(order);
    } catch (error) {
        res.status(500).send(error);
    }
});

// GET ORDER STATS
router.get("/stats", isAdmin, async (req, res) => {
    try {
        const previousMonth = moment()
            .subtract(1, 'month')
            .startOf('month')
            .format("YYYY-MM-DD HH:mm:ss");

        const orders = await Order.aggregate([
            {
                $match: { createdAt: { $gte: new Date(previousMonth) } },
            },
            {
                $project: {
                    month: { $month: "$createdAt" },
                },
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: 1 },
                },
            },
        ]);

        res.status(200).json(orders);
    } catch (err) {
        console.error("Error fetching order statistics:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET USER ORDERS
router.get('/user', auth, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id }).sort({ _id: -1 });
        res.status(200).send(orders);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});


// GET INCOME STATS
router.get("/income/stats", isAdmin, async (req, res) => {
    try {
        const previousMonth = moment()
            .subtract(1, 'month')
            .startOf('month')
            .format("YYYY-MM-DD HH:mm:ss");

        const income = await Order.aggregate([
            {
                $match: { createdAt: { $gte: new Date(previousMonth) } },
            },
            {
                $project: {
                    month: { $month: "$createdAt" },
                    sales: "$total"
                },
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: "$sales" },
                },
            },
        ]);

        res.status(200).json(income);
    } catch (err) {
        console.error("Error fetching income statistics:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET 1 WEEK STATS
router.get("/week-sales", isAdmin, async (req, res) => {
    try {
        const last7Days = moment()
            .day(moment().day() - 7)
            .format("YYYY-MM-DD HH:mm:ss");

        const income = await Order.aggregate([
            {
                $match: { createdAt: { $gte: new Date(last7Days) } },
            },
            {
                $project: {
                    day: { $dayOfWeek: "$createdAt" },
                    sales: "$total"
                },
            },
            {
                $group: {
                    _id: "$day",
                    total: { $sum: "$sales" },
                },
            },
        ]);

        res.status(200).json(income);
    } catch (err) {
        console.error("Error fetching income statistics:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// CANCEL ORDER
router.put("/cancel/:id", auth, async (req, res) => {
    try {
        const canceledOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: { delivery_status: "canceled" } },
            { new: true }
        );
        res.status(200).send(canceledOrder);
    } catch (err) {
        res.status(500).send(err);
    }
});

// REQUEST RETURN
router.put("/return/:id", auth, async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: { delivery_status: "return_requested" } },
            { new: true }
        );
        res.status(200).send(order);
    } catch (err) {
        console.error("Error processing return request:", err);
        res.status(500).send(err);
    }
});

// APPROVE RETURN
router.put("/request/approve/return/:id", isAdmin, async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: { delivery_status: "return_approved" } },
            { new: true }
        );
        res.status(200).send(order);
    } catch (err) {
        console.error("Error approving return request:", err);
        res.status(500).send(err);
    }
});

// DENY RETURN
router.put("/request/deny/return/:id", isAdmin, async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: { delivery_status: "return_denied" } },
            { new: true }
        );
        res.status(200).send(order);
    } catch (err) {
        console.error("Error denying return request:", err);
        res.status(500).send(err);
    }
});


module.exports = router;
