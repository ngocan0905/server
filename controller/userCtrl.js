const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const uniqid = require("uniqid");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshToken");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(
  "sk_test_51OMpt3ABlcms0qAX9k2e61WDlo0hdjPN8vf1svKasohmQjkKIIC3d9A5VgLKBOqA0kKCtWbh7Hkb4QxiF5BjVmJh00kxhAhqbG"
);
const sendEmail = require("./emailCtrl");
// create user
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    res.json({
      msg: "User already exists",
      success: false,
    });
  }
});
// login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Kiểm tra email và password có tồn tại không
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.isPasswordMatched(password))) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  let responseData = {
    _id: user._id,
    firstname: user.firstName,
    lastname: user.lastName,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    token: generateToken(user._id),
  };

  if (user.role === "admin") {
    const refreshToken = generateRefreshToken(user._id);
    await User.findByIdAndUpdate(user._id, { refreshToken }, { new: true });

    responseData = {
      ...responseData,
      refreshToken,
      role: user.role,
    };
  }

  res.cookie("refreshToken", responseData.refreshToken, {
    httpOnly: true,
    maxAge: 72 * 60 * 60 * 1000,
  });

  res.json(responseData);
});
// login admin
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const findAdmin = await User.findOne({ email });
  if (findAdmin.role !== "admin") throw new Error("Not Authorised");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const updateuser = await User.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken: refreshToken,
      },
      {
        new: true,
      }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstName,
      lastname: findAdmin?.lastName,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: generateToken(findAdmin?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});
// save user address
const saveAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const updateUser = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body?.address,
      },
      { new: true }
    );
    res.json(updateUser);
  } catch (error) {
    throw new Error(error);
  }
});
// get all user
const getAllUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find().populate("cart");
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

// get single user
const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getUser = await User.findById(id);
    res.json(getUser);
  } catch (error) {
    throw new Error(error);
  }
});
// handle refresh token
const handleRefeshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) {
    throw new Error("No refresh token in cookies");
  }
  const refreshToken = cookie.refreshToken;
  console.log(refreshToken);
  const user = await User.findOne({ refreshToken });
  if (!user) {
    throw new Error("No refresh token present in db or not matched");
  }
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decode) => {
    if (err || user.id !== decode.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(user?.id);
    res.json({ accessToken });
  });
});
// logout user
const logoutUser = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie.refreshToken) {
    this.route.params.id("Không có token làm mới trong cookie");
  }
  const refreshToken = cookie.refreshToken;

  const user = await User.findOneAndUpdate({ refreshToken }, { $set: { refreshToken: "" } });

  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204);
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });

  return res.sendStatus(204);
});

// update user
const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const updatedById = await User.findByIdAndUpdate(
      _id,
      {
        firstName: req?.body?.firstName,
        lastName: req?.body?.lastName,
        mobile: req?.body?.mobile,
        role: req?.body?.role,
      },
      { new: true }
    );
    res.json(updatedById);
  } catch (error) {}
});
// block user
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const block = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      { new: true }
    );

    res.json(block);
  } catch (error) {
    throw new Error(error);
  }
});
// unblock user
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      { new: true }
    );
    res.json(unblock);
  } catch (error) {
    throw new Error(error);
  }
});
// delete user
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteThisUser = await User.findByIdAndDelete(id);
    res.json("Deleted success");
  } catch (error) {
    throw new Error(error);
  }
});
// update password

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatePassword = await user.save();
    res.json(updatePassword);
  } else {
    res.json(user);
  }
});
// forgot password

const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found with this email");
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi, please folow this link to reset your password. This link is valid till 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password/${token}'>Click here</a>`;
    const data = {
      to: email,
      text: "Hey user",
      subject: "Forgot password link",
      html: resetURL,
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});
// reset password
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    throw new Error("Token expired, please try again later");
  }
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});
// wishlist
const getWishList = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id).populate("wishlist");
    res.json(findUser);
  } catch (error) {
    throw new Error(error);
  }
});
//add to cart
const addProductToCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let existingCart = await Cart.findOne({ orderby: user._id });
    if (!existingCart) {
      existingCart = new Cart({ orderby: user._id, products: [] });
    }
    for (let i = 0; i < cart.length; i++) {
      const product = await Product.findById(cart[i]._id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const existingProductIndex = existingCart.products.findIndex(
        (item) => item.product.toString() === product._id.toString() && item.color === cart[i].color
      );
      if (existingProductIndex !== -1) {
        existingCart.products[existingProductIndex].count += cart[i].count;
      } else {
        existingCart.products.push({
          product: product._id,
          count: cart[i].count,
          color: cart[i].color,
          price: product.price,
        });
      }
    }
    existingCart.cartTotal = existingCart.products.reduce(
      (total, product) => total + product.price * product.count,
      0
    );

    await existingCart.save();
    res.json(existingCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// get user cart
const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.findOne({ orderby: _id }).populate("products.product");
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});
// empty
const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findById(_id);
    const cart = await Cart.findOneAndRemove({ orderby: user._id });
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});
// delete product in cart by id
const removeProductInCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { id: productId } = req.params; // Thay đổi nếu bạn truyền productId từ front-end

  try {
    // Tìm người dùng và giỏ hàng của họ
    const user = await User.findById(_id);
    const cart = await Cart.findOne({ orderby: user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Xóa sản phẩm từ danh sách sản phẩm trong giỏ hàng
    cart.products = cart.products.filter((item) => item.product.toString() !== productId);

    // Cập nhật tổng giá trị giỏ hàng sau khi xóa sản phẩm
    cart.cartTotal = cart.products.reduce(
      (total, product) => total + product.price * product.count,
      0
    );

    // Lưu thay đổi vào cơ sở dữ liệu
    await cart.save();

    res.json(cart); // Trả về giỏ hàng sau khi xóa sản phẩm
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  const validCoupon = await Coupon.findOne({ name: coupon });
  if (validCoupon === null) {
    throw new Error("Invalid coupon");
  }
  const user = await User.findOne({ _id: _id });
  let { products, cartTotal } = await Cart.findOne({
    orderby: user._id,
  }).populate("products.product");
  let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount) / 100).toFixed(2);
  await Cart.findOneAndUpdate(
    { orderby: user._id },
    {
      totalAfterDiscount,
    },
    { new: true }
  );
  res.json(totalAfterDiscount);
});
//
const createOrder = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { paymentMethodId, amount } = req.body;
  try {
    // Lấy thông tin giỏ hàng của người dùng
    const user = await User.findById(_id);
    const userCart = await Cart.findOne({ orderby: user._id });

    // Tính toán số tiền cuối cùng cho đơn hàng
    // const finalAmount = userCart.totalAfterDiscount || userCart.cartTotal;

    // Thực hiện thanh toán qua Stripe và nhận kết quả trả về từ hàm xử lý thanh toán
    const paymentResponse = await processPayment(paymentMethodId, amount);

    // Xử lý sau khi thanh toán thành công
    const { clientSecret } = paymentResponse;

    // Tạo đơn hàng sau khi thanh toán thành công
    const newOrder = await createOrderAfterPayment(_id, amount, userCart.products);
    await Cart.findOneAndDelete({ orderby: user._id });
    // Trả về kết quả cho người dùng
    res.json({ message: "Order created successfully after payment", clientSecret });
  } catch (error) {
    console.error("Error creating order:", error.message);
    res.status(500).json({ error: "Có lỗi xảy ra khi tạo đơn hàng và xử lý thanh toán" });
  }
});
const processPayment = async (paymentMethodId, amount) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      payment_method: paymentMethodId,
      amount: amount * 100, // Số tiền thanh toán, ví dụ: 1000 đơn vị (đã được chuyển đổi sang đơn vị tiền tệ của bạn)
      currency: "usd", // Đơn vị tiền tệ của bạn
      description: "Mô tả thanh toán",
      confirm: true,
      return_url: "http://localhost:5173/",
    });

    // Xử lý sau khi thanh toán, nếu cần thiết
    return { clientSecret: paymentIntent.client_secret };
  } catch (error) {
    throw new Error(error.message);
  }
};
// Hàm tạo đơn hàng sau khi thanh toán
const createOrderAfterPayment = async (_id, finalAmount, products) => {
  try {
    const newOrder = await new Order({
      products,
      paymentIntent: {
        id: uniqid(),
        method: "Stripe",
        amount: finalAmount,
        status: "Paid",
        created: Date.now(),
        currency: "usd",
      },
      orderby: _id,
      orderStatus: "Paid",
    }).save();

    await updateProductInfo(products);
    return newOrder;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Hàm cập nhật thông tin sản phẩm sau khi thanh toán thành công
const updateProductInfo = async (products) => {
  try {
    const update = products.map((item) => ({
      updateOne: {
        filter: { _id: item.product._id },
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    }));

    await Product.bulkWrite(update, {});
  } catch (error) {
    throw new Error(error.message);
  }
};

//
const getOrder = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const userOrders = await Order.findOne({ orderby: _id }).populate("products.product").exec();
    res.json(userOrders);
  } catch (error) {
    throw new Error(error);
  }
});
//
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const findAndUpdateOrder = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: {
          status: status,
        },
      },
      { new: true }
    );
    res.json(findAndUpdateOrder);
  } catch (error) {
    throw new Error(error);
  }
});
const getSoldOrders = asyncHandler(async (req, res) => {
  try {
    // Lấy trang và số lượng đơn hàng từ query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Tính toán vị trí bắt đầu của trang và số lượng đơn hàng cần bỏ qua
    const startIndex = (page - 1) * limit;

    // Lấy tổng số lượng đơn hàng
    const totalOrders = await Order.countDocuments();

    // Lấy danh sách các đơn hàng đã bán với phân trang
    const soldOrders = await Order.find({ orderStatus: { $in: ["Confirmed", "Paid"] } })
      .skip(startIndex)
      .limit(limit)
      .populate("products.product")
      .exec();

    const allSoldOrders = await Order.find({ orderStatus: { $in: ["Confirmed", "Paid"] } })
      .populate("products.product")
      .exec();

    const totalRevenue = allSoldOrders.reduce((total, order) => {
      return total + order.paymentIntent.amount;
    }, 0);
    // Trả về danh sách các đơn hàng đã bán, tổng số lượng đơn hàng và thông tin phân trang cho admin
    res.json({
      soldOrders,
      totalOrders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalRevenue: totalRevenue,
    });
  } catch (error) {
    console.error("Error fetching sold orders:", error.message);
    res.status(500).json({ error: "Có lỗi xảy ra khi lấy danh sách các đơn hàng đã bán" });
  }
});
//
//get revenue by day
const getRevenueByDay = asyncHandler(async (req, res) => {
  try {
    const { date } = req.params; // Ngày cần lấy doanh thu, có thể được truyền từ frontend hoặc route

    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1); // Tăng ngày lên 1 để lấy hết cả ngày đó

    const ordersByDay = await Order.find({
      createdAt: { $gte: startDate, $lt: endDate },
      orderStatus: { $in: ["Confirmed", "Paid"] },
    });

    const totalRevenueByDay = ordersByDay.reduce((total, order) => {
      return total + order.paymentIntent.amount;
    }, 0);

    res.json({ date, totalRevenue: totalRevenueByDay });
  } catch (error) {
    console.error("Error fetching revenue by day:", error.message);
    res.status(500).json({ error: "Có lỗi xảy ra khi lấy doanh thu theo ngày" });
  }
});
// get revenue by month
const getRevenueByMonth = asyncHandler(async (req, res) => {
  try {
    const { year, month } = req.params; // Năm và tháng cần lấy doanh thu

    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1); // Tăng tháng lên 1 để lấy hết cả tháng đó

    const ordersByMonth = await Order.find({
      createdAt: { $gte: startDate, $lt: endDate },
      orderStatus: { $in: ["Confirmed", "Paid"] },
    });

    const totalRevenueByMonth = ordersByMonth.reduce((total, order) => {
      return total + order.paymentIntent.amount;
    }, 0);

    res.json({ year, month, totalRevenue: totalRevenueByMonth });
  } catch (error) {
    console.error("Error fetching revenue by month:", error.message);
    res.status(500).json({ error: "Có lỗi xảy ra khi lấy doanh thu theo tháng" });
  }
});
module.exports = {
  createUser,
  loginUser,
  loginAdmin,
  logoutUser,
  getAllUser,
  getUser,
  updateUser,
  blockUser,
  unblockUser,
  deleteUser,
  handleRefeshToken,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  getWishList,
  saveAddress,
  addProductToCart,
  getUserCart,
  emptyCart,
  removeProductInCart,
  applyCoupon,
  createOrder,
  getOrder,
  updateOrderStatus,
  getSoldOrders,
  getRevenueByDay,
  getRevenueByMonth,
};
