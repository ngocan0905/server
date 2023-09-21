const Color = require("../models/colorModel");
const asyncHandler = require("express-async-handler");
const validateMongoId = require("../utils/validateMongodbId");

// create Color

const createColor = asyncHandler(async (req, res) => {
  try {
    const newColor = await Color.create(req.body);
    res.json(newColor);
  } catch (error) {
    throw new Error(error);
  }
});
// update Color
const updateColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const updateColor = await Color.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateColor);
  } catch (error) {
    throw new Error(error);
  }
});
// delete Color
const deleteColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const deleteColor = await Color.findByIdAndDelete(id);
    res.json("delete successed");
  } catch (error) {
    throw new Error(error);
  }
});
// get all Color
const getAllColor = asyncHandler(async (req, res) => {
  try {
    const getAll = await Color.find();
    res.json(getAll);
  } catch (error) {
    throw new Error(error);
  }
});
// get Color by id
const getColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const getColor = await Color.findById(id);
    res.json(getColor);
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = {
  createColor,
  updateColor,
  deleteColor,
  getAllColor,
  getColor,
};
