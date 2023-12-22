const stripe = require("stripe")(
  "sk_test_51OMpt3ABlcms0qAX9k2e61WDlo0hdjPN8vf1svKasohmQjkKIIC3d9A5VgLKBOqA0kKCtWbh7Hkb4QxiF5BjVmJh00kxhAhqbG"
);
const asyncHandler = require("express-async-handler");
const processPayment = asyncHandler(async (req, res) => {
  try {
    const { paymentMethodId, amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      payment_method: paymentMethodId,
      amount: amount, // Số tiền thanh toán, ví dụ: 1000 đơn vị (đã được chuyển đổi sang đơn vị tiền tệ của bạn)
      currency: "usd", // Đơn vị tiền tệ của bạn
      description: "Mô tả thanh toán",
      confirm: true,
      return_url: "https://www.facebook.com/reel/1459838384565910",
    });

    // Xử lý sau khi thanh toán, nếu cần thiết
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    throw new Error(error.message);
  }
});
module.exports = processPayment;
