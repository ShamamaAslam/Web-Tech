function requireLogin(req, res, next) {
  if (req.session && req.session.user) return next();

  // remember page user wanted
  req.session.returnTo = req.originalUrl;

  // redirect to login/account page
  return res.redirect("/account");
}

function isAdmin(req, res, next) {
  if (!req.session?.user) return res.redirect("/account");
  if (req.session.user.role !== "admin") return res.status(403).send("Access denied");
  return next();
}

module.exports = { requireLogin, isAdmin };
