const express = require("express");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {
  createCoupon,
  getAllCoupon,
  updateCoupon,
  deleteCoupon,
  markCouponAsUsed,
} = require("../controller/couponCtrl");

const router = express.Router();
router.post("/", authMiddleware, isAdmin, createCoupon);
router.get("/", authMiddleware, isAdmin, getAllCoupon);
router.put("/:id", authMiddleware, isAdmin, updateCoupon);
router.delete("/:id", authMiddleware, isAdmin, deleteCoupon);
router.patch("/mark-used/:couponName", authMiddleware, isAdmin, markCouponAsUsed);

module.exports = router;
