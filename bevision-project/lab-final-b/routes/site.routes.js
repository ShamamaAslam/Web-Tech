const router = require("express").Router();

// Home page
router.get("/", (req, res) => {
  res.render("pages/index", { title: "Home", pageCss: "style.css" });
});

// About page
router.get("/about", (req, res) => {
  res.render("pages/about", { title: "About", pageCss: "About_style.css" });
});

// Treatments page
router.get("/treatments", (req, res) => {
  res.render("pages/treatments", { title: "Treatments", pageCss: "Treatments_style.css" });
});

// Staff page
router.get("/staff", (req, res) => {
  res.render("pages/staff", { title: "Staff", pageCss: "Staff_styles.css" });
});


module.exports = router;
