require("dotenv").config();

const express = require("express");   // 1️⃣ import express FIRST
const path = require("path");
const mongoose = require("mongoose");

const app = express();               // 2️⃣ create app AFTER express

const session = require("express-session");

app.use(session({
  secret: "bevision-secret-key",
  resave: false,
  saveUninitialized: false
}));
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// parse form data
app.use(express.urlencoded({ extended: true }));



// serve static files
app.use(express.static(path.join(__dirname, "public")));

// view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Mongo error:", err));

// routes
app.use("/", require("./routes/orders.routes")); // ✅ Moved to top
const siteRoutes = require("./routes/site.routes");
app.use("/", siteRoutes);

const buyRoutes = require("./routes/buy.routes");
app.use("/", buyRoutes);

const adminRoutes = require("./routes/admin.routes");
app.use("/admin", adminRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/", authRoutes);

app.use("/", require("./routes/choice.routes"));

const buyNowRoutes = require("./routes/buyNow.routes");
app.use("/", buyNowRoutes);

app.use("/", require("./routes/cart.routes"));

app.use("/", require("./routes/checkout.routes"));

app.use("/", require("./routes/appointment.routes"));

app.use("/", require("./routes/contact.routes"));




// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
