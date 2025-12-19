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

// ✅ Place order
router.post("/checkout", async (req, res) => {
  try {
    const { email, country, phone } = req.body;

    const gmailOnly = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailOnly.test(email || "")) {
      return res.render("pages/checkout", { title:"Checkout", pageCss:"checkout.css", error:"Only @gmail.com email is allowed." });
    }

    const countryPrefixes = {
      Pakistan: "+92",
      USA: "+1",
      UK: "+44",
    };

    if (countryPrefixes[country]) {
      const prefix = countryPrefixes[country];
      if (!(phone || "").startsWith(prefix)) {
        return res.render("pages/checkout", {
          title:"Checkout",
          pageCss:"checkout.css",
          error:`Phone must start with ${prefix} for ${country}.`
        });
      }
    }

    // proceed checkout...
    return res.redirect("/checkout-success");
  } catch (e) {
    console.error(e);
    return res.render("pages/checkout", { title:"Checkout", pageCss:"checkout.css", error:"Something went wrong." });
  }
});


// ✅ Success page (fixes: Cannot GET /order-success)
router.get("/order-success", requireLogin, (req, res) => {
  return res.render("pages/order-success", {
    title: "Order Success",
    pageCss: "order-success.css"
  });
});

module.exports = router;
