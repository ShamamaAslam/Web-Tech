const router = require("express").Router();
const ContactMessage = require("../models/ContactMessage");

// show contact page
router.get("/contact", (req, res) => {
  res.render("pages/contact", { title: "Contact", error: null, success: null });
});

// handle contact form
router.post("/contact", async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").trim();
    const subject = (req.body.subject || "").trim();
    const message = (req.body.message || "").trim();

    // ✅ server-side required validation
    if (!name || !email || !message) {
      return res.render("pages/contact", {
        title: "Contact",
        error: "Name, Email and Message are required.",
        success: null
      });
    }

    // ✅ save in MongoDB
    await ContactMessage.create({ name, email, subject, message });

    // ✅ show success message on same page
    return res.render("pages/contact", {
      title: "Contact",
      error: null,
      success: "Message sent successfully!"
    });
  } catch (err) {
    console.error(err);
   res.render("pages/contact", {
  title: "Contact",
  error: null,
  success: null
});
  }
});

module.exports = router;
