const express = require("express");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const signToken = require("../utils/createToken");
const catchAsync = require("./../utils/catchAsync")
const AppError = require("./../utils/appError")
const {
  sendPasswordResetOTPEmail,
  resetUserPassword,
} = require("../utils/helpers");
const sendVerificationEmailOtp = require("../utils/sendVerifcationaEmail");




exports.signUp = catchAsync(async (req, res, next) => {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      const error = new AppError ("please fill all fields", 400);

      return next(error)
    }

    const isExisting = await userModel.findOne({ email });
    if (isExisting) {
      const error = new AppError ("Email already in use by another user", 400);

      return next(error)

    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    await sendVerificationEmailOtp(email);

    return res.status(201).json({
      status: "success",
      data: {
        user,
      },
    });
  }
);

exports.login = catchAsync(async (req, res, next) => {
  
    let { email, password } = req.body;

    const checkEmail = await userModel.findOne({ email }).select("+password");

    if (!checkEmail) {
      const error = new AppError ("Incorrect email or provided", 400);

      return next(error)

    }

    const checkPassword = await bcrypt.compare(password, checkEmail.password);

    if (!checkPassword) {
      const error =new  AppError ("Incorrect password or email provided", 400);

      return next(error)

    }

    if (!checkEmail.verified) {
      const error = new AppError ("Email is not verified, Check your inbox...", 400);

      return next(error)

    }
    // create Token

    const token = signToken(checkEmail._id);
    // console.log(token)

    // assign token to user
    checkEmail.token = token;

    return res.status(201).json({
      status: "success",
      message: "Login successful",
      token,
      data: {
        checkEmail,
      },
    });
  }
);

// Password reset request
exports.forgotPassword = catchAsync(async (req, res, next) => {
  
    const { email } = req.body;

    if (!email) {
      const error = new AppError ("Email is required", 400);

      return next(error)

    }

    const createdPasswordResetOtp = await sendPasswordResetOTPEmail(email);

    res.status(201).json({
      status: "success",
      data: {
        createdPasswordResetOtp,
      },
    });
  
});



// Verify Password Reset OTP from user
exports.passwordReset = catchAsync(async (req, res, next) => {
  
    let { email, newPassword, OTP } = req.body;

    if (!(email && newPassword && OTP)) {
      const error = new AppError("Please fill all fields...", 400);

      return next(error)

    }

    await resetUserPassword({ email, newPassword, OTP });

    res.status(201).json({ email, Passwordreset: true });
 
});

