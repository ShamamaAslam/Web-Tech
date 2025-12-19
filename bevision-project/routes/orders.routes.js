const router = require("express").Router();
const Order = require("../models/Order");

// GET /my-orders (Search Form)
router.get("/my-orders", (req, res) => {
    res.render("pages/my-orders", {
        title: "My Orders",
        pageCss: "checkout.css", // Reuse styles
        orders: null,
        searchEmail: "",
        error: null
    });
});

// POST /my-orders (Search Results)
router.post("/my-orders", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.render("pages/my-orders", {
            title: "My Orders",
            pageCss: "checkout.css",
            orders: null,
            searchEmail: email,
            error: "Please enter an email address."
        });
    }

    try {
        const orders = await Order.find({ "buyer.email": email }).sort({ createdAt: -1 }).lean();

        res.render("pages/my-orders", {
            title: "My Orders",
            pageCss: "checkout.css",
            orders,
            searchEmail: email,
            error: orders.length ? null : "No orders found for this email."
        });
    } catch (err) {
        console.error(err);
        res.render("pages/my-orders", {
            title: "My Orders",
            pageCss: "checkout.css",
            orders: null,
            searchEmail: email,
            error: "An error occurred while fetching orders."
        });
    }
});

module.exports = router;
