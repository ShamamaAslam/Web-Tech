require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const data = [
  { name: "Eye Drops", price: 450, category: "Medicine", image: "/images/p1.jpg", description: "Soothing drops" },
  { name: "Reading Glasses", price: 1200, category: "Accessories", image: "/images/p2.jpg", description: "Anti-glare" },
  { name: "Lens Cleaner", price: 250, category: "Care", image: "/images/p3.jpg", description: "Cleaner spray" },
  { name: "Sunglasses", price: 2200, category: "Accessories", image: "/images/p4.jpg", description: "UV protection" },
  { name: "Artificial Tears", price: 400, category: "Medicine", image: "/images/p5.jpg", description: "Dry eye relief" },
  { name: "Frame Classic", price: 2000, category: "Frames", image: "/images/p6.jpg", description: "Metal frame" },
  { name: "Toric Lens", price: 2100, category: "Lenses", image: "/images/p7.jpg", description: "For astigmatism" },
  { name: "Contact Solution", price: 500, category: "Care", image: "/images/p8.jpg", description: "Disinfect solution" },
  { name: "Eye Vitamins", price: 800, category: "Supplements", image: "/images/p9.jpg", description: "Daily support" },
  { name: "Premium Sunglasses", price: 3200, category: "Accessories", image: "/images/p10.jpg", description: "Polarized" },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany({});
    await Product.insertMany(data);
    console.log("Seeded!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
