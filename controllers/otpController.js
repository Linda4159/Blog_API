const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const otpModel = require("../models/otpModel");
const userModel = require("../models/userModel")
const {verifyUserEmail, sendOTP, verifyOTP }= require("../utils/helpers")
const sendVerificationEmailOtp = require("../utils/sendVerifcationaEmail")


// Create and send OTP to user
exports.otpAccess = async (req, res) => {
  try {


    const { email, subject, message, duration } = req.body;

    const createdOtp = await sendOTP({
      email,
      subject,
      message,
      duration,
    });


    return res.status(201).json(createdOtp);
  } catch (error) {
    return res.status(404).json({
      status: "fail",
      message: "Unable to generate OTP",
      error: error.message,
    });
  }
};

// Verify the OTP user's input
exports.verifyNewOtp = async (req, res) => {
  try {
    let { email, OTP } = req.body;

    const validOTP = await verifyOTP({ email, OTP });
    res.status(201).json({ valid: validOTP });
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: "Unable to verify OTP",
      error: error.message,
    });
  }
};

// User request for email verification
exports.verifyEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) throw Error("An email is required");

    const createdEmailVerificationOtp = await sendVerificationEmailOtp(email);

    res.status(201).json(createdEmailVerificationOtp);

  } catch (error) {
    
    return res.status(400).json({
      status: "fail",
      message: "Email verifcation unsuccessful",
      error: error.message
    });
  }
};

// Confirm the OTP the user sends (Verification)
exports.emailVerification = async (req, res) => {
  try {
    let { email, OTP } = req.body;

    if (!(email && OTP)) {
      throw Error("Provide your OTP details");
    }

    await verifyUserEmail({ email, OTP });

    res.status(201).json({ email, verified: true });
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: "Email verifiication failed",
      error: error.message,
    });
  }
};
