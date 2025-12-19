const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        qty: Number,
        image: String,
      },
    ],

    total: { type: Number, default: 0 },

    buyer: {
      name: String,
      email: String,
      phone: String,
      address: String,
    },

    status: { type: String, default: "paid" },
  },
  { timestamps: true } // ✅ IMPORTANT for date/time in admin
);

module.exports = mongoose.model("Order", orderSchema);
