function getCart(req) {
  if (!req.session.cart) req.session.cart = [];
  return req.session.cart;
}

function addToCart(req, product, qty = 1) {
  const cart = getCart(req);
  const existing = cart.find(i => String(i.productId) === String(product._id));
  if (existing) existing.qty += qty;
  else cart.push({
    productId: product._id,
    name: product.name,
    price: product.price,
    image: product.image || "",
    qty
  });
}

function changeQty(req, productId, delta) {
  const cart = getCart(req);
  const item = cart.find(i => String(i.productId) === String(productId));
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    req.session.cart = cart.filter(i => String(i.productId) !== String(productId));
  }
}

function removeItem(req, productId) {
  const cart = getCart(req);
  req.session.cart = cart.filter(i => String(i.productId) !== String(productId));
}

function cartTotal(req) {
  const cart = getCart(req);
  return cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
}

module.exports = { getCart, addToCart, changeQty, removeItem, cartTotal };
