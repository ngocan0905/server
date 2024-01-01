const Product = require("../models/productModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const { cloudinaryUploadImg, cloudinaryDeleteImg } = require("../utils/cloudinary");
const fs = require("fs");
const slugify = require("slugify");
// create product
const createProduct = asyncHandler(async (req, res) => {
  try {
    const { title, images } = req.body;
    if (title) {
      req.body.slug = slugify(title);
    }
    const newProduct = await Product.create(req.body);
    if (images && images.length > 0) {
      const uploadImages = [];
      const uploader = (path) => cloudinaryUploadImg(path, "images");
      for (const image of images) {
        const { path } = image;
        const newImage = uploader(path);
        uploadImages.push(newImage);
        fs.unlinkSync(path);
      }
    }
    res.json(newProduct);
  } catch (error) {
    throw new Error(error);
  }
});
// update product
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updateProduct = await Product.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
    });
    res.json(updateProduct);
  } catch (error) {
    throw new Error(error);
  }
});
// delete product
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteProduct = await Product.findOneAndDelete({ _id: id });
    res.json(deleteProduct);
  } catch (error) {
    throw new Error(error);
  }
});
// get all product
const getAllProduct = asyncHandler(async (req, res) => {
  try {
    // filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    console.log(queryObj);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let query = Product.find(JSON.parse(queryStr));
    // sorting
    if (req.query.sort === "price_desc") {
      query = query.sort("-price");
    } else if (req.query.sort === "price_asc") {
      query = query.sort("price");
    } else if (req.query.sort === "sold_desc") {
      query = query.sort("-soldQuantity");
    } else {
      query = query.sort("-createdAt"); // Default sorting
    }
    // limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }
    // panigation
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error("This page does not exists");
    }
    console.log(page, limit, skip);
    const products = await query;
    res.json(products);
  } catch (error) {
    throw new Error(error);
  }
});
// search product
const searchProductByName = asyncHandler(async (req, res) => {
  const { productName } = req.query;

  try {
    // Tìm sản phẩm dựa trên tên sản phẩm
    const products = await Product.find({
      title: { $regex: new RegExp(productName, "i") }, // Sử dụng biểu thức chính quy không phân biệt chữ hoa chữ thường
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to search products", error: error.message });
  }
});

// get product by id
const getaProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const product = await Product.findById(id);
    res.json(product);
  } catch (error) {
    throw new Error(error);
  }
});
// add to wish list

const addToWishList = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;
  try {
    const user = await User.findById(_id);
    const alreadyAdded = user.wishlist.find((id) => id.toString() === prodId);
    if (alreadyAdded) {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $pull: {
            wishlist: prodId,
          },
        },
        { new: true }
      );
      res.json(user);
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $push: {
            wishlist: prodId,
          },
        },
        { new: true }
      );
      res.json(user);
    }
  } catch (error) {
    throw new Error(error);
  }
});
// rating
const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, prodId, comment } = req.body;
  let sanitizedComment = comment;
  const profanityWords = /\b(cặc|lồn|cu|cc|lol|buồi|chết|đụ|dm|cl)\b/gi;
  sanitizedComment = sanitizedComment.replace(profanityWords, (match) => {
    return "*".repeat(match.length);
  });
  try {
    const product = await Product.findById(prodId);
    let alreadyRated = product.ratings.find(
      (userId) => userId.postedby.toString() === _id.toString()
    );
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": sanitizedComment },
        },
        { new: true }
      );
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star: star,
              comment: sanitizedComment,
              postedby: _id,
            },
          },
        },
        { new: true }
      );
    }
    const getAllRating = await Product.findById(prodId);
    let totalRating = getAllRating.ratings.length;
    let ratingSum = getAllRating.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = ratingSum / totalRating;
    let finalProduct = await Product.findByIdAndUpdate(
      prodId,
      {
        totalrating: actualRating,
      },
      { new: true }
    );
    res.json(finalProduct);
  } catch (error) {
    throw new Error(error);
  }
});
// upload image
const uploadImages = asyncHandler(async (req, res) => {
  try {
    const uploader = (path) => cloudinaryUploadImg(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath);
      fs.unlinkSync(path);
    }
    const images = urls.map((file) => {
      return file;
    });
    res.json(images);
  } catch (error) {
    throw new Error(error);
  }
});
// delte image
const deleteImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    console.log(id);
    const deleted = await cloudinaryDeleteImg(id, "images");
    if (deleted) {
      res.json({ message: "Image deleted successfully" });
    } else {
      res.status(404).json({ message: "Image not found or could not be deleted" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete image", error: error });
  }
});
// add tag to product
const addTags = asyncHandler(async (req, res) => {
  const { productId, tags } = req.body;
  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ message: "Please provide valid tags in an array" });
    }

    for (const tag of tags) {
      if (!product.tags.includes(tag)) {
        product.tags.push(tag); // Thêm tag mới vào mảng tags của sản phẩm
      }
    }

    await product.save();

    res.json({ message: "Tags added successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Failed to add tags to product", error: error.message });
  }
});

// delete tag from product
const deleteTag = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const { tagToDelete } = req.body;
  validateMongoDbId(productId);
  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!tagToDelete || typeof tagToDelete !== "string") {
      return res.status(400).json({ message: "Please provide a valid tag to delete" });
    }

    const initialTagsLength = product.tags.length;
    product.tags = product.tags.filter((tag) => tag !== tagToDelete);

    if (product.tags.length === initialTagsLength) {
      return res.status(404).json({ message: "Tag not found in product" });
    }

    await product.save();

    res.json({ message: `Tag '${tagToDelete}' deleted successfully`, product });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete tag from product", error: error.message });
  }
});

module.exports = {
  createProduct,
  getAllProduct,
  searchProductByName,
  getaProduct,
  updateProduct,
  deleteProduct,
  addToWishList,
  rating,
  uploadImages,
  deleteImages,
  addTags,
  deleteTag,
};
