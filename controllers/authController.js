const catchAsync = require("../middlewares/catchAsync");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken");
const bcrypt = require("bcryptjs");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const existedEmail = await User.findOne({ email });
  if (!existedEmail) {
    throw new ApiError(400, "email or password is incorrect");
  }
  const isMatch = bcrypt.compareSync(password, existedEmail.password);
  if (!isMatch) {
    throw new ApiError(400, "email or password is incorrect");
  }

  const token = jwt.sign(
    {
      email: existedEmail.email,
      role: existedEmail.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_TOKEN_EXPRIED,
    }
  );

  const refreshToken = await RefreshToken.createToken(existedEmail);
  res.status(200).json({
    success: true,
    token,
    refreshToken,
    email,
  });
});

exports.register = catchAsync(async (req, res) => {
  const { email, password, fullname } = req.body;
  if (!email || !password || !fullname) {
    throw new ApiError(400, "Please enter all fields");
  }
  const users = await User.find({});
  const existedEmail = users.some((val) => val.email === email);
  if (existedEmail) {
    throw new ApiError(400, "Email is existed!");
  }
  const customer = await stripe.customers.create({
    email,
  });

  const user = await User.create({
    email,
    password,
    fullname,
    customerID: customer.id,
  });
  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.getProfile = catchAsync(async (req, res) => {
  const headerToken = req.headers.authorization;

  if (!headerToken) {
    throw new ApiError(401, "Unauthorized");
  }
  const token = headerToken.split(" ")[1];
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findOne({
      email: user.email,
    });
    res.status(200).json({
      success: true,
      data: currentUser,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Token is expried");
    }
    throw new ApiError(401, "Unauthorized");
  }
});
