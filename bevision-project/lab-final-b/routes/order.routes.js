const router = require("express").Router();
const Order = require("../models/Order");

// ✅ helper to compute totals from session cart
function getCartSummary(cart = []) {
  const items = cart.map(i => ({
    productId: i.productId,
    name: i.name,
    price: Number(i.price) || 0,
    qty: Number(i.qty) || 1,
    image: i.image || ""
  }));

  const total = items.reduce((sum, x) => sum + x.price * x.qty, 0);
  return { items, total };
}

// ✅ GET /order/preview
router.get("/order/preview", (req, res) => {
  const cart = req.session.cart || [];
  if (!cart.length) return res.redirect("/cart");

  const { items, total } = getCartSummary(cart);

  return res.render("pages/order-preview", {
    title: "Order Preview",
    pageCss: "order-preview.css",
    items,
    total
  });
});

// ✅ POST /order/confirm
router.post("/order/confirm", async (req, res) => {
  const cart = req.session.cart || [];
  if (!cart.length) return res.redirect("/cart");

  const { items, total } = getCartSummary(cart);

  // ✅ Save order in MongoDB
  const order = await Order.create({
    items,
    total,
    status: "Placed",
    buyer: {
      // if you store user email in session, it will go here
      email: req.session.user?.email || req.body.email || ""
    }
  });

  // ✅ Clear cart session
  req.session.cart = [];

  // ✅ Redirect to success page with summary
  return res.redirect(`/order/success/${order._id}`);
});

// ✅ GET /order/success/:id
router.get("/order/success/:id", async (req, res) => {
  const order = await Order.findById(req.params.id).lean();
  if (!order) return res.redirect("/purchase");

  return res.render("pages/order-success-summary", {
    title: "Order Success",
    pageCss: "order-success.css",
    order
  });
});

module.exports = router;
