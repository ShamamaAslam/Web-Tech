const router = require("express").Router();
const Product = require("../models/Product");

router.get("/products", (req, res) =>
  res.redirect("/purchase?" + new URLSearchParams(req.query).toString())
);


router.get("/purchase", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 6, 1), 50);

    const category = req.query.category || "";
    const min = req.query.min ? Number(req.query.min) : null;
    const max = req.query.max ? Number(req.query.max) : null;

    const filter = {};
    if (category) filter.category = category;

    if (min !== null || max !== null) {
      filter.price = {};
      if (min !== null) filter.price.$gte = min;
      if (max !== null) filter.price.$lte = max;
    }

    const skip = (page - 1) * limit;

    const [items, total, categories] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filter),
      Product.distinct("category"),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    res.render("pages/buy-now", {
      title: "Buy Now",
      pageCss: "buy-now.css",
      items,
      page,
      limit,
      totalPages,
      categories,
      query: req.query,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading Buy Now page");
  }
});

module.exports = router;
