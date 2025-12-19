const router = require("express").Router();
const { requireLogin } = require("../middleware/auth");
const Appointment = require("../models/Appointment");

// ✅ Show appointment form
router.get("/appointments/new", requireLogin, (req, res) => {
  res.render("pages/appointment-new", {
    title: "Book Appointment",
    pageCss: "appointment.css",
    error: null,
  });
});

// ✅ Submit appointment
router.post("/appointments", requireLogin, async (req, res) => {
  try {
    const {
      patientName,
      patientEmail,
      phone,
      date,
      time,
      notes,
    } = req.body;

    if (!patientName || !patientEmail || !phone || !date || !time) {
      return res.render("pages/appointment-new", {
        title: "Book Appointment",
        pageCss: "appointment.css",
        error: "All required fields must be filled.",
      });
    }

    // ❌ block past dates (server side)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const picked = new Date(date);
    picked.setHours(0, 0, 0, 0);

    if (picked < today) {
      return res.render("pages/appointment-new", {
        title: "Book Appointment",
        pageCss: "appointment.css",
        error: "You cannot select a past date.",
      });
    }

    await Appointment.create({
      userId: req.session.user._id || req.session.user.id,
      patientName,
      email: patientEmail,          // ✅ schema field
      phone,                        // ✅ schema field
      appointmentDate: date,        // ✅ YYYY-MM-DD
      appointmentTime: time,        // ✅ 10:00
      notes,
    });

    return res.redirect("/appointment-success");
  } catch (err) {
    console.error("Appointment Error:", err);
    return res.render("pages/appointment-new", {
      title: "Book Appointment",
      pageCss: "appointment.css",
      error: "Something went wrong. Try again.",
    });
  }
});

// ✅ Success page
router.get("/appointment-success", requireLogin, (req, res) => {
  res.render("pages/appointment-success", {
    title: "Appointment Confirmed",
    pageCss: "appointment-success.css",
  });
});

module.exports = router;
