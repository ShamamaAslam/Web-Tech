const router = require("express").Router();

router.get("/buy-now", (req, res) => {
  res.render("pages/buy-choice", { title: "Choose", pageCss: "buy-choice.css" });
});

module.exports = router;
