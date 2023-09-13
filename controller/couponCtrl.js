const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

//  create coupon
const createCoupon = asyncHandler(async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.json(coupon);
  } catch (error) {
    throw new Error(error);
  }
});
// update coupon
const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const newCoupon = await Coupon.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(newCoupon);
  } catch (error) {
    throw new Error(error);
  }
});
// delete coupon
const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteCoupon = await Coupon.findByIdAndDelete(id);
    res.json("delete successed");
  } catch (error) {
    throw new Error(error);
  }
});

// get all coupon
const getAllCoupon = asyncHandler(async (req, res) => {
  try {
    const allCoupon = await Coupon.find();
    res.json(allCoupon);
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = { createCoupon, updateCoupon, deleteCoupon, getAllCoupon };
