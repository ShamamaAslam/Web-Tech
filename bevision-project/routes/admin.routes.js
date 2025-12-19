const router = require("express").Router();

const Product = require("../models/Product");
const Order = require("../models/Order");
const Appointment = require("../models/Appointment");
const ContactMessage = require("../models/ContactMessage");

function requireAdmin(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  if (req.session.user.role !== "admin") return res.status(403).send("Access denied");
  next();
}

// ✅ /admin
router.get("/", requireAdmin, async (req, res) => {
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();
  const totalAppointments = await Appointment.countDocuments();
  const totalMessages = await ContactMessage.countDocuments();

  const revenueAgg = await Order.aggregate([{ $group: { _id: null, revenue: { $sum: "$total" } } }]);
  const totalRevenue = revenueAgg[0]?.revenue || 0;

  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).lean();
  const recentAppointments = await Appointment.find().sort({ createdAt: -1 }).limit(5).lean();
  const recentMessages = await ContactMessage.find().sort({ createdAt: -1 }).limit(5).lean();

  res.render("admin/dashboard", {
    title: "Admin Dashboard",
    pageCss: "admin.css",
    totalProducts,
    totalOrders,
    totalAppointments,
    totalMessages,
    totalRevenue,
    recentOrders,
    recentAppointments,
    recentMessages,
  });
});
// ✅ /admin/products (list)
router.get("/products", requireAdmin, async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  res.render("admin/products", {
    title: "Products",
    pageCss: "admin.css",
    products
  });
});


// ✅ /admin/products/new (form page)
router.get("/products/new", requireAdmin, (req, res) => {
  res.render("admin/product-new", {
    title: "Add Product",
    pageCss: "admin.css",
  });
});

// ✅ /admin/products/new (create)
router.post("/products/new", requireAdmin, async (req, res) => {
  const { name, price, category, image, description } = req.body;

  await Product.create({
    name,
    price,
    category,
    image,
    description,
  });

  return res.redirect("/admin/products");
});

// ✅ /admin/products/edit/:id (edit page)
router.get("/products/edit/:id", requireAdmin, async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) return res.redirect("/admin/products");

  res.render("admin/product-edit", {
    title: "Edit Product",
    pageCss: "admin.css",
    product
  });
});



// ✅ /admin/products/edit/:id (save edit)
router.post("/products/edit/:id", requireAdmin, async (req, res) => {
  const { name, price, category, image, description } = req.body;

  await Product.findByIdAndUpdate(req.params.id, {
    name,
    price,
    category,
    image,
    description
  });

  return res.redirect("/admin/products");
});

// ✅ /admin/products/delete/:id
router.post("/products/delete/:id", requireAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  return res.redirect("/admin/products");
});

const { getNextStatus, canTransition } = require("../utils/orderLifecycle");

// ✅ /admin/orders
router.get("/orders", requireAdmin, async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).lean();

  // Attach nextStatus to each order for UI
  orders.forEach(o => {
    o.nextStatus = getNextStatus(o.status);
  });

  res.render("admin/orders", { title: "Orders", pageCss: "admin.css", orders });
});

// ✅ /admin/order/:id/status
router.post("/order/:id/status", requireAdmin, async (req, res) => {
  console.log(`[ADMIN] Status Update Request for ${req.params.id}`);
  console.log(`[ADMIN] Body Status: ${req.body.status}`);
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      console.log("[ADMIN] Order not found");
      return res.status(404).send("Order not found");
    }

    console.log(`[ADMIN] Current Status: ${order.status}, Requested: ${status}`);

    if (canTransition(order.status, status)) {
      order.status = status;
      await order.save();
      console.log("[ADMIN] Status updated successfully");
    } else {
      console.error(`[ADMIN] Invalid transition from ${order.status} to ${status}`);
    }

    return res.redirect("/admin/orders");
  } catch (e) {
    console.error(e);
    return res.redirect("/admin/orders");
  }
});

// ✅ /admin/orders/:id
router.get("/orders/:id", requireAdmin, async (req, res) => {
  const order = await Order.findById(req.params.id).lean();
  if (!order) return res.redirect("/admin/orders");
  res.render("admin/order-details", { title: "Order Details", pageCss: "admin.css", order });
});

// ✅ /admin/appointments
router.get("/appointments", requireAdmin, async (req, res) => {
  const appointments = await Appointment.find().sort({ createdAt: -1 }).lean();
  res.render("admin/appointments", { title: "Appointments", pageCss: "admin.css", appointments });
});

// ✅ /admin/messages
router.get("/messages", requireAdmin, async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();
  res.render("admin/messages", { title: "Messages", pageCss: "admin.css", messages });
});

module.exports = router;
