const { requireLogin } = require("../middleware/auth");

const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// OPEN CHECKOUT PAGE
router.get("/buy/:id", requireLogin, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.redirect("/buy-now");

  const orderItems = [{
    productId: product._id,
    name: product.name,
    price: product.price,
    qty: 1,
    image: product.image
  }];

  const subtotal = product.price;
  const shipping = 250;
  const tax = 0;
  const total = subtotal + shipping + tax;

return res.render("pages/checkout", {
  title: "Checkout",
  pageCss: "checkout.css",

  error: null,        // ✅ REQUIRED
  success: null,      // ✅ SAFE

  orderItems,
  subtotal,
  shipping,
  tax,
  total,

  formAction: `/buy/${product._id}`,
  backUrl: "/buy-now",
});

});


// PLACE ORDER (dummy, but functional)
router.post("/buy/:id", requireLogin, async (req, res) =>{
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).render("pages/404", { title: "Not Found" });

    // You can save to DB later. For now: just show success page.
    res.render("pages/order-success", {
      title: "Order Placed",
      pageCss: "checkout.css",
      product,
      form: req.body,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
