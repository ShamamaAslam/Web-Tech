const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// ✅ Account choice page (circle icon goes here)
router.get("/account", (req, res) => {
  if (req.session.user) return res.redirect("/products"); // or /profile
  res.render("auth/account", { title: "Account" });
});

// show login page
router.get("/login", (req, res) => {
  res.render("auth/login", { title: "Login", error: null });
});

// handle login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.render("auth/login", { title: "Login", error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render("auth/login", { title: "Login", error: "Invalid email or password" });
    }

    req.session.user = { id: user._id, role: user.role, email: user.email };

   if (user.role === "admin") return res.redirect("/admin");

// ✅ go back to the page user originally wanted (like /buy/123)
const redirectTo = req.session.returnTo || "/products";
delete req.session.returnTo;

return res.redirect(redirectTo);

  } catch (err) {
    console.error(err);
    return res.render("auth/login", { title: "Login", error: "Something went wrong" });
  }
});

// show register page
router.get("/register", (req, res) => {
  res.render("auth/register", { title: "Register", error: null });
});

// handle register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("auth/register", { title: "Register", error: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.render("auth/register", { title: "Register", error: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

   const newUser = await User.create({ email, password: hashed, role: "user" });

// ✅ auto login
req.session.user = { id: newUser._id, role: newUser.role, email: newUser.email };

const redirectTo = req.session.returnTo || "/products";
delete req.session.returnTo;

return res.redirect(redirectTo);

  } catch (err) {
    console.error(err);
    return res.render("auth/register", { title: "Register", error: "Something went wrong" });
  }
});

// logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/account"));
});

module.exports = router;
