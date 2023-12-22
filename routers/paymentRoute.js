const express = require("express");
const router = express.Router();
const processPayment = require("../controller/paymentController.js");

// Định nghĩa endpoint xử lý thanh toán
router.post("/process-payment", processPayment);

module.exports = router;
