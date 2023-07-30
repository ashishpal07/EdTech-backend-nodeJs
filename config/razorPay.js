const RazorPay = require("razorpay");

module.exports.instance = new RazorPay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
    
})