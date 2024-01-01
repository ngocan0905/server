const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

// Tạo mã coupon mới
const createCoupon = asyncHandler(async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cập nhật thông tin của coupon
const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedCoupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Xóa mã coupon
const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    await Coupon.findByIdAndDelete(id);
    res.json({ message: "Delete successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lấy tất cả các mã coupon
const getAllCoupon = asyncHandler(async (req, res) => {
  try {
    const allCoupon = await Coupon.find();
    res.json(allCoupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Đánh dấu mã coupon đã sử dụng
const markCouponAsUsed = asyncHandler(async (req, res) => {
  const { couponName } = req.params;
  try {
    const coupon = await Coupon.markAsUsed(couponName);
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { createCoupon, updateCoupon, deleteCoupon, getAllCoupon, markCouponAsUsed };
