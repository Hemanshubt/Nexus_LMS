const Razorpay = require('razorpay');
require('dotenv').config({ path: 'd:/LSM/server/.env' });

const rzp = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function test() {
    try {
        console.log('Testing with Key ID:', process.env.RAZORPAY_KEY_ID);
        const order = await rzp.orders.create({
            amount: 100,
            currency: 'INR',
            receipt: 'test_receipt'
        });
        console.log('✅ Success! Order created:', order.id);
    } catch (err) {
        console.error('❌ Failed! Error:', err);
    }
}

test();
