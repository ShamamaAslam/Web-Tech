require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User"); // relative to root

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await User.create({
    email: "admin@bevision.com",
    password: hashedPassword,
    role: "admin"
  });

  console.log("Admin user created");
  process.exit();
})();
