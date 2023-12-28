const express = require("express");
const {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishList,
  rating,
  uploadImages,
  deleteImages,
  searchProductByName,
  addTags,
  deleteTag,
} = require("../controller/productCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { uploadPhoto, productImgResize } = require("../middlewares/uploadImages");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createProduct);
router.post(
  "/upload",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 10),
  productImgResize,
  uploadImages
);
router.get("/", getAllProduct);
router.get("/search", searchProductByName);
router.get("/:id", getaProduct);
router.put("/wishlist", authMiddleware, addToWishList);
router.put("/rating", authMiddleware, rating);
router.post("/tag", authMiddleware, isAdmin, addTags);
router.patch("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/tag/:id", authMiddleware, isAdmin, deleteTag);
router.delete("/delete-img/:id", authMiddleware, isAdmin, deleteImages);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

module.exports = router;
