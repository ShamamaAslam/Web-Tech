function applyDiscount(req) {
    const coupon = req.body.coupon || req.query.coupon;

    if (coupon && coupon.toUpperCase() === "SAVE10") {
        return {
            code: "SAVE10",
            percent: 10,
            isValid: true
        };
    }
    return null;
}

module.exports = { applyDiscount };
