const express = require("express");
const {
  createBlog,
  getAllBlog,
  updateBlog,
  deleteBlog,
  getBlog,
  likeBlog,
  dislikeBlog,
  uploadImages,
} = require("../controller/blogCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { uploadPhoto, blogImgResize } = require("../middlewares/uploadImages");
const router = express.Router();
router.post("/create-blog", authMiddleware, isAdmin, createBlog);
router.put(
  "/upload/:id",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 10),
  blogImgResize,
  uploadImages
);
router.get("/all-blog", getAllBlog);
router.get("/:id", getBlog);
router.put("/dislikes", authMiddleware, dislikeBlog);
router.put("/likes", authMiddleware, likeBlog);
router.put("/update-blog/:id", authMiddleware, isAdmin, updateBlog);

router.delete("/delete-blog/:id", authMiddleware, isAdmin, deleteBlog);
module.exports = router;
