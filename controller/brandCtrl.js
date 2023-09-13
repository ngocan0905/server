const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");
const validateMongoId = require("../utils/validateMongodbId");

// create brand

const createBrand = asyncHandler(async (req, res) => {
  try {
    const newBrand = await Brand.create(req.body);
    res.json(newBrand);
  } catch (error) {
    throw new Error(error);
  }
});
// update brand
const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const updateBrand = await Brand.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateBrand);
  } catch (error) {
    throw new Error(error);
  }
});
// delete brand
const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const deleteBrand = await Brand.findByIdAndDelete(id);
    res.json("delete successed");
  } catch (error) {
    throw new Error(error);
  }
});
// get all brand
const getAllBrand = asyncHandler(async (req, res) => {
  try {
    const getAll = await Brand.find();
    res.json(getAll);
  } catch (error) {
    throw new Error(error);
  }
});
// get brand by id
const getBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const getBrand = await Brand.findById(id);
    res.json(getBrand);
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = {
  createBrand,
  updateBrand,
  deleteBrand,
  getAllBrand,
  getBrand,
};
