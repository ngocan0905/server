const express = require("express");
const {
  createBlog,
  getAllBlog,
  updateBlog,
  deleteBlog,
} = require("../controller/blogCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/create-blog", authMiddleware, isAdmin, createBlog);
router.get("/all-blog", getAllBlog);

router.put("/update-blog/:id", authMiddleware, isAdmin, updateBlog);
router.delete("/delete-blog/:id", authMiddleware, isAdmin, deleteBlog);
module.exports = router;
