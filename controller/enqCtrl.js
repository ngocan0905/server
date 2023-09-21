const Enquiry = require("../models/enqModel");
const asyncHandler = require("express-async-handler");
const validateMongoId = require("../utils/validateMongodbId");

// create Enq

const createEnq = asyncHandler(async (req, res) => {
  try {
    const newEnq = await Enq.create(req.body);
    res.json(newEnq);
  } catch (error) {
    throw new Error(error);
  }
});
// update Enq
const updateEnq = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const updateEnq = await Enq.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateEnq);
  } catch (error) {
    throw new Error(error);
  }
});
// delete Enq
const deleteEnq = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const deleteEnq = await Enq.findByIdAndDelete(id);
    res.json("delete successed");
  } catch (error) {
    throw new Error(error);
  }
});
// get all Enq
const getAllEnq = asyncHandler(async (req, res) => {
  try {
    const getAll = await Enq.find();
    res.json(getAll);
  } catch (error) {
    throw new Error(error);
  }
});
// get Enq by id
const getEnq = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const getEnq = await Enq.findById(id);
    res.json(getEnq);
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = {
  createEnq,
  updateEnq,
  deleteEnq,
  getAllEnq,
  getEnq,
};
