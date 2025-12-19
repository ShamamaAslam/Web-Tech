const router = require("express").Router();
const { requireLogin } = require("../middleware/auth");
const Order = require("../models/Order");

// helper: build order summary from session cart
function buildSummary(cart = []) {
  const orderItems = cart.map(i => ({
    productId: i.productId,
    name: i.name,
    price: i.price,
    qty: i.qty,
    image: i.image
  }));

  const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = 250;
  const tax = 0;
  const total = subtotal + shipping + tax;

  return { orderItems, subtotal, shipping, tax, total };
}

// ✅ Checkout page
router.get("/checkout", requireLogin, (req, res) => {
  const cart = req.session.cart || [];
  if (!cart.length) return res.redirect("/cart");

  const { orderItems, subtotal, shipping, tax, total } = buildSummary(cart);

  return res.render("pages/checkout", {
    title: "Checkout",
    pageCss: "checkout.css",
    orderItems,
    subtotal,
    shipping,
    tax,
    total,
    formAction: "/checkout",
    backUrl: "/cart",
    error: null
  });
});

// ✅ Process Checkout Form -> Redirect to Preview
router.post("/checkout", requireLogin, async (req, res) => {
  try {
    const cart = req.session.cart || [];
    if (!cart.length) return res.redirect("/cart");

    const { orderItems, subtotal, shipping, tax, total } = buildSummary(cart);
    const { email, country, phone, fullName, address, city, zip, payMethod } = req.body;

    // Validation
    const gmailOnly = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailOnly.test(email || "")) {
      return res.render("pages/checkout", {
        title: "Checkout",
        pageCss: "checkout.css",
        orderItems, subtotal, shipping, tax, total,
        formAction: "/checkout", backUrl: "/cart",
        error: "Only @gmail.com email is allowed."
      });
    }

    const countryPrefixes = { Pakistan: "+92", USA: "+1", UK: "+44" };
    if (countryPrefixes[country]) {
      const prefix = countryPrefixes[country];
      if (!(phone || "").startsWith(prefix)) {
        return res.render("pages/checkout", {
          title: "Checkout",
          pageCss: "checkout.css",
          orderItems, subtotal, shipping, tax, total,
          formAction: "/checkout", backUrl: "/cart",
          error: `Phone must start with ${prefix} for ${country}.`
        });
      }
    }

    // Save strictly necessary fields to session as "pending order"
    req.session.orderPreview = {
      orderItems,
      subtotal,
      shipping,
      tax,
      total,
      buyer: {
        name: fullName,
        email,
        phone,
        address: `${address}, ${city}, ${zip}, ${country}`,
        payMethod
      }
    };

    return res.redirect("/order/preview");

  } catch (e) {
    console.error(e);
    return res.redirect("/checkout");
  }
});

// ✅ Order Preview
router.get("/order/preview", requireLogin, (req, res) => {
  const pending = req.session.orderPreview;
  if (!pending) return res.redirect("/cart");

  return res.render("pages/order-preview", {
    title: "Order Preview",
    pageCss: "checkout.css", // Reuse checkout styles for consistency
    orderItems: pending.orderItems,
    subtotal: pending.subtotal,
    shipping: pending.shipping,
    tax: pending.tax,
    total: pending.total,
    buyer: pending.buyer
  });
});

// ✅ Finalize Order
router.post("/order/finalize", requireLogin, async (req, res) => {
  try {
    const pending = req.session.orderPreview;
    if (!pending) return res.redirect("/cart");

    // Create Order
    await Order.create({
      userId: req.session.user.id,
      items: pending.orderItems,
      subtotal: pending.subtotal,
      shipping: pending.shipping,
      tax: pending.tax,
      total: pending.total,
      buyer: {
        name: pending.buyer.name,
        email: pending.buyer.email,
        phone: pending.buyer.phone,
        address: pending.buyer.address
      },
      status: "placed",
      createdAt: new Date()
    });

    // Clear Cart & Preview
    req.session.cart = [];
    delete req.session.orderPreview;

    return res.redirect("/order-success");

  } catch (err) {
    console.error("Order Finalize Error:", err);
    return res.redirect("/cart");
  }
});


// ✅ Success page
router.get("/order-success", requireLogin, (req, res) => {
  return res.render("pages/order-success", {
    title: "Order Success",
    pageCss: "order-success.css"
  });
});
router.get("/checkout-success", requireLogin, (req, res) => {
  return res.redirect("/order-success");
});

module.exports = router;
