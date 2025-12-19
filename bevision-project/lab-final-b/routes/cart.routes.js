const router = require("express").Router();
const Product = require("../models/Product");
const { requireLogin } = require("../middleware/auth");

// view cart
router.get("/cart", requireLogin, (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  res.render("pages/cart", {
    title: "Cart",
    pageCss: "cart.css",
    cart,
    total,
  });
});
router.get("/cart/add/:id", requireLogin, async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) return res.redirect("/purchase");

  const cart = req.session.cart || [];
  const existing = cart.find(i => String(i.productId) === String(product._id));

  if (existing) existing.qty += 1;
  else cart.push({
    productId: product._id,
    name: product.name,
    price: product.price,
    qty: 1,
    image: product.image,
  });

  req.session.cart = cart;
  return res.redirect("/cart");
});


router.get("/cart/add/:id", (req, res) => {
  res.status(405).send("GET request detected — frontend bug");
});

// add to cart (bucket icon)
router.post("/cart/add/:id", requireLogin, async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) return res.redirect("/purchase");

  let cart = req.session.cart || [];

  const existing = cart.find(i => String(i.productId) === String(product._id));
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      qty: 1,
      image: product.image,
    });
  }

  req.session.cart = cart;
  return res.redirect("/cart"); // ✅ open cart page
});

// decrease qty
router.post("/cart/dec/:id", requireLogin, (req, res) => {
  let cart = req.session.cart || [];
  const item = cart.find(i => String(i.productId) === String(req.params.id));
  if (item) item.qty -= 1;
  cart = cart.filter(i => i.qty > 0);
  req.session.cart = cart;
  return res.redirect("/cart");
});

// remove item
router.post("/cart/remove/:id", requireLogin, (req, res) => {
  const cart = req.session.cart || [];
  req.session.cart = cart.filter(i => String(i.productId) !== String(req.params.id));
  return res.redirect("/cart");
});

module.exports = router;
