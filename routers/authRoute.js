const express = require("express");
const {
  createUser,
  getAllUser,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  handleRefeshToken,
  logoutUser,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginUser,
  loginAdmin,
  getWishList,
  saveAddress,
  addProductToCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrder,
  updateOrderStatus,
} = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();
router.post("/register", createUser);
router.post("/forgot-password", forgotPasswordToken);
router.put("/reset-password/:token", resetPassword);
router.put("/order/update-order/:id", authMiddleware, isAdmin, updateOrderStatus);
router.put("/password", authMiddleware, updatePassword);
router.post("/login", loginUser);
router.post("/admin-login", loginAdmin);
router.post("/cart", authMiddleware, addProductToCart);
router.post("/cart/apply-coupon", authMiddleware, applyCoupon);
router.post("/cart/cash-order", authMiddleware, createOrder);
router.delete("/cart", authMiddleware, emptyCart);
router.get("/all-user", getAllUser);
router.get("/get-order", authMiddleware, getOrder);
router.get("/refresh", handleRefeshToken);
router.get("/logout", authMiddleware, logoutUser);
router.get("/wishlist", authMiddleware, getWishList);
router.get("/cart", authMiddleware, getUserCart);
router.get("/:id", getUser);
router.put("/edit-user", authMiddleware, updateUser);
router.put("/save-address", authMiddleware, saveAddress);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);
router.delete("/:id", deleteUser);
module.exports = router;
