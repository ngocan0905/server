const mongoose = require("mongoose");

const revenueSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    totalRevenue: {
      type: Number,
      required: true,
    },
    ordersCount: {
      type: Number,
      required: true,
    },
    // Các trường khác có thể được thêm tùy thuộc vào yêu cầu của bạn
    // Ví dụ: thông tin về nguồn doanh thu, doanh thu theo sản phẩm, v.v.
  },
  { timestamps: true }
);

const Revenue = mongoose.model("Revenue", revenueSchema);

module.exports = Revenue;
