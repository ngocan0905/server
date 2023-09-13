const express = require("express");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategory,
  getCategory,
} = require("../controller/productCategoryCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createCategory);
router.put("/:id", authMiddleware, isAdmin, updateCategory);
router.delete("/:id", authMiddleware, isAdmin, deleteCategory);
router.get("/", getAllCategory);
router.get("/:id", getCategory);
module.exports = router;
