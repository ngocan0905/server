const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createBlog = asyncHandler(async (req, res) => {
  try {
    const newBlog = await Blog.create(req.body);
    res.json({
      status: "success",
      newBlog,
    });
  } catch (error) {
    throw new Error(error);
  }
});
// get all blog
const getAllBlog = asyncHandler(async (req, res) => {
  try {
    const allBlog = await Blog.find();
    res.json(allBlog);
  } catch (error) {
    throw new Error(error);
  }
});
// get blog by id

// update blog
const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const updateBlog = await Blog.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
    });
    res.json(updateBlog);
  } catch (error) {
    throw new Error(error);
  }
});
// delete blog
const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deleteBlog = await Blog.findOneAndDelete(id);
    res.json("delete success");
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = { createBlog, getAllBlog, updateBlog, deleteBlog };
