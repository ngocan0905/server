const Category = require("../models/blogCategoryModel");
const asyncHandler = require("express-async-handler");
const validateMongoId = require("../utils/validateMongodbId");

// create
const createCategory = asyncHandler(async (req, res) => {
  try {
    const createCategory = await Category.create(req.body);
    res.json(createCategory);
  } catch (error) {
    throw new Error(error);
  }
});
// update
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const updateCategory = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateCategory);
  } catch (error) {
    throw new Error(error);
  }
});
// delete
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const deleteCategory = await Category.findByIdAndDelete(id);
    res.json("Delete successed");
  } catch (error) {
    throw new Error(error);
  }
});
// get all
const getAllCategory = asyncHandler(async (req, res) => {
  try {
    const getAll = await Category.find();
    res.json(getAll);
  } catch (error) {
    throw new Error(error);
  }
});
// get by id
const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const getCategory = await Category.findById(id);
    res.json(getCategory);
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategory,
  getCategory,
};
