const http = require('http');
const querystring = require('querystring');

// Configuration
const BASE_URL = 'http://localhost:3000';
let cookie = null;

// Helper to make requests
function request(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            method,
            hostname: 'localhost',
            port: 3000,
            path,
            headers: { ...headers },
            maxRedirects: 0 // Handle redirects manually
        };

        if (cookie) {
            options.headers['Cookie'] = cookie;
        }

        if (data) {
            const postData = querystring.stringify(data);
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                // Update cookie if present
                if (res.headers['set-cookie']) {
                    const newCookies = res.headers['set-cookie'].map(c => c.split(';')[0]);
                    // Simple merge
                    cookie = newCookies.join('; ');
                }
                resolve({ statusCode: res.statusCode, headers: res.headers, body });
            });
        });

        req.on('error', (e) => reject(e));

        if (data) {
            req.write(querystring.stringify(data));
        }
        req.end();
    });
}

async function run() {
    try {
        console.log("Starting Discount Verification...");

        // 1. Register/Login
        const email = `test_coupon_${Date.now()}@gmail.com`;
        console.log(`1. Registering user: ${email}`);
        await request('POST', '/register', { email: email, password: 'password' });
        if (!cookie) throw new Error("No session cookie after registration");
        console.log("   Logged in.");

        // 2. Add Product
        console.log("2. Adding Product to Cart");
        const shopRes = await request('GET', '/purchase');
        const productMatch = shopRes.body.match(/\/cart\/add\/([a-f0-9]{24})/);
        if (!productMatch) throw new Error("Could not find product");
        await request('POST', `/cart/add/${productMatch[1]}`);
        console.log("   Added to cart.");

        // 3. Checkout WITH Coupon
        console.log("3. Checkout with Coupon 'SAVE10'");
        const checkoutRes = await request('POST', '/checkout', {
            fullName: 'Discount Buyer',
            email: email,
            phone: '+923001234567',
            address: '123 Discount Lane',
            city: 'SaleCity',
            zip: '90210',
            country: 'Pakistan',
            payMethod: 'card',
            cardName: 'Card', cardNum: '4242 4242', cardExp: '12/25', cardCvv: '123',
            coupon: 'SAVE10' // <--- COUPON
        });

        if (checkoutRes.statusCode !== 302 || !checkoutRes.headers.location.includes('/order/preview')) {
            throw new Error("Checkout failed to redirect to preview");
        }
        console.log("   Redirected to Preview.");

        // 4. Verify Discount on Preview
        console.log("4. Verifying Discount in Preview");
        const previewRes = await request('GET', '/order/preview');
        if (!previewRes.body.includes('Discount (SAVE10)')) {
            throw new Error("Preview page DOES NOT show discount!");
        }
        console.log("   Discount Verified on Preview Page.");

        // 5. Finalize
        console.log("5. Finalizing Order");
        await request('POST', '/order/finalize');
        console.log("   Order Finalized.");

        console.log("✅ COUPON VERIFICATION SUCCESSFUL");

    } catch (err) {
        console.error("❌ VERIFICATION FAILED:", err.message);
        process.exit(1);
    }
}

run();
