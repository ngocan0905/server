const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product", // Thay "product" bằng tên model của sản phẩm
        },
        count: Number,
        color: String,
      },
    ],
    paymentIntent: {
      // Thêm các trường thông tin liên quan đến thanh toán từ Stripe
      id: String,
      method: {
        type: String,
        enum: ["Stripe", "PayPal", "CreditCard"], // Có thể thêm các phương thức thanh toán khác
      },
      amount: Number,
      status: {
        type: String,
        default: "Paid",
        enum: ["Paid"],
      },
      created: Date,
      currency: String,
      name: String,
      email: String,
    },
    orderStatus: {
      type: String,
      default: "Paid",
      enum: ["Paid"],
    },
    orderby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("order", orderSchema);
