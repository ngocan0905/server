const mongoose = require("mongoose");

// Declare the Schema of the Mongo model
const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  expiry: {
    type: Date,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
});

// Phương thức để đánh dấu mã Coupon đã sử dụng
couponSchema.statics.markAsUsed = async function (couponName) {
  try {
    const Coupon = this; // Lấy reference tới model Coupon
    const coupon = await Coupon.findOne({ name: couponName });
    if (!coupon) {
      throw new Error("Coupon not found");
    }
    if (coupon.isUsed) {
      throw new Error("Coupon has already been used");
    }
    coupon.isUsed = true;
    await coupon.save();
    return coupon;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Tạo model từ schema
const Coupon = mongoose.model("coupon", couponSchema);

module.exports = Coupon;
