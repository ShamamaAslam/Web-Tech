function requireLogin(req, res, next) {
  if (req.session?.user) return next();
  req.session.returnTo = req.originalUrl;
  return res.redirect("/login");
}

function isAdmin(req, res, next) {
  if (!req.session?.user) return res.redirect("/login");
  if (req.session.user.role !== "admin") return res.status(403).send("Access denied");
  return next();
}

module.exports = { requireLogin, isAdmin };
