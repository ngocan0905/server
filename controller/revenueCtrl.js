const Revenue = require("../models/revenueModel"); // Import model

// Trích xuất thông tin doanh thu từ đơn hàng và tạo một bản ghi Revenue mới
const createRevenueEntry = async (date, totalRevenue, ordersCount) => {
  try {
    const newRevenueEntry = new Revenue({
      date,
      totalRevenue,
      ordersCount,
      // Thêm các trường khác nếu cần
    });

    const savedRevenue = await newRevenueEntry.save();
    return savedRevenue;
  } catch (error) {
    throw new Error(error.message);
  }
};
