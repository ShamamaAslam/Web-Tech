const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    patientName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    appointmentDate: { type: String, required: true }, // e.g. "2025-12-19"
    appointmentTime: { type: String, required: true }, // e.g. "10:30 AM"

    doctor: { type: String, default: "" },
    notes: { type: String, default: "" },

    status: { type: String, default: "booked" }, // booked/cancelled/completed
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
