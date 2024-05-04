const express = require("express");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const signToken = require("../utils/createToken");
const {
  sendPasswordResetOTPEmail,
  resetUserPassword,
} = require("../utils/helpers");
const sendVerificationEmailOtp = require("../utils/sendVerifcationaEmail");




exports.signUp = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw Error("please fill all fields");
    }

    const isExisting = await userModel.findOne({ email });
    if (isExisting) {
      throw Error("Email already in use by another user");
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
  } catch (error) {
    return res.status(404).json({
      status: "fail",
      message: "Failed to create user",
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;

    const checkEmail = await userModel.findOne({ email });

    if (!checkEmail) {
      throw Error("Incorrect email provided");
    }

    const checkPassword = bcrypt.compare(password, checkEmail.password);

    if (!checkPassword) {
      throw Error("Incorrect password provided");
    }

    if (!checkEmail.verified) {
      throw Error("Email is not verified, Check your inbox...");
    }
    // create Token

    const token = signToken(checkEmail._id);
    // console.log(token)

    // assign token to user
    checkEmail.token = token;

    return res.status(201).json({
      status: "success",
      message: "Login successful",
      data: {
        checkEmail,
      },
    });
  } catch (error) {
    return res.status(404).json({
      status: "fail",
      message: "Login failed",
      error: error.message,
    });
  }
};

// Password reset request
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw Error("Email is required");
    }

    const createdPasswordResetOtp = await sendPasswordResetOTPEmail(email);

    res.status(201).json({
      status: "success",
      data: {
        createdPasswordResetOtp,
      },
    });
  } catch (error) {
    return res.status(404).json({
      status: "fail",
      message: "OTP for passowrd reset failed",
      error: error.message,
    });
  }
};

// Verify Password Reset OTP from user
exports.passwordReset = async (req, res) => {
  try {
    let { email, newPassword, OTP } = req.body;

    if (!(email && newPassword && OTP)) {
      throw Error("Please fill all fields...");
    }

    await resetUserPassword({ email, newPassword, OTP });

    res.status(201).json({ email, Passwordreset: true });
  } catch (error) {
    return res.status(404).json({
      status: "fail",
      message: "Password reset failed",
      error: error.message,
    });
  }
};
