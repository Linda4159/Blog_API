const userModel = require("../models/userModel");
const { sendOTP } = require("./helpers");

// Generate OTP new email verification
const sendVerificationEmailOtp = async (email) => {
  try {
    const checkUser = await userModel.findOne({ email });

    if (!checkUser) {
      throw Error(
        "There is no user with this email, Please enter a valid email..."
      );
    }

    const otpDetails = {
      email,
      subject: "Email Verification",
      message: "Verify your email with the code below",
      duration: 60,
    };

    const createdOtp = await sendOTP(otpDetails);
    return createdOtp;
  } catch (error) {
    throw Error;
  }
};

module.exports = sendVerificationEmailOtp;
