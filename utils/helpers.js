const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const generateOTP = require("../utils/generateOTP");
const otpModel = require("../models/otpModel");
const sendEmail = require("../utils/sendEmail");
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");

// Send generated OTP to the user and hash the created OTP before sending to the database
const sendOTP = async ({ email, subject, message, duration }) => {
  try {
    if (!(email && subject && message)) {
      throw Error("All fields required");
    }

    // clear any old OTP record
    await otpModel.deleteOne({ email });

    // generate new pin
    const generatedOTP = await generateOTP();

    // send Email
    const mailOptions = {
      from: process.env.AUTH_MAIL,
      to: email,
      subject,
      html: `<p>${message}</p style="color:tomato;font-size:25px;letter-spacing:2px;"><b>${generatedOTP}</b></p><p>This code <b>expires in ${duration} minute(s)<b/>.</p>`,
    };

    await sendEmail(mailOptions);

    // save the OTP record
    const saltOTP = await bcrypt.genSalt(10);
    const hashedOTP = await bcrypt.hash(generatedOTP, saltOTP);

    const newOTP = await otpModel.create({
      email,
      OTP: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000 * +duration,
    });

    const createdOtpRecord = await newOTP.save();
    return createdOtpRecord;
  } catch (error) {
    throw Error;
  }
};

// Verify the OTP the user input and compare it with the one sent to the database
const verifyOTP = async ({ email, OTP }) => {
  try {
    if (!email || !OTP) {
      throw Error("Email and OTP required");
    }

    // check if OTP exist
    const confirmOTP = await otpModel.findOne({ email });
    // console.log(confirmOTP)

    if (!confirmOTP) {
      throw Error("No OTP record found");
    }

    // check if OTP has expired
    const { expiresAt } = confirmOTP;

    if (expiresAt < Date.now()) {
      await otpModel.deleteOne({ email });
      throw Error("OTP has expired, request for a new one...");
    }

    // verify OTP
    const compareOTP = confirmOTP.OTP;
    const validOTP = await bcrypt.compare(OTP, compareOTP);

    return validOTP;
  } catch (error) {
    throw Error;
  }
};

// Verify the OTP the user sent back if it conrespond with what what sent to the user's email
const verifyUserEmail = async ({ email, OTP }) => {
  try {
    const validOTP = await verifyOTP({ email, OTP });

    if (!validOTP) {
      throw Error("Wrong OTP passed, check your inbox for the right OTP...");
    }

    // Update user account to be verified
    await userModel.updateOne({ email }, { verified: true });

    await deleteOtp(email);

    return;
  } catch (error) {
    throw Error;
  }
};

// Delete OTP from the database
const deleteOtp = async (email) => {
  try {
    await otpModel.deleteOne({ email });
  } catch (error) {
    throw Error;
  }
};

// Request for Password Reset OTP
const sendPasswordResetOTPEmail = async (email) => {
  try {
    const isExisting = await userModel.findOne({ email });

    if (!isExisting) {
      throw Error("Account with this email does not exist...");
    }

    if (!isExisting.verified) {
      throw Error(
        "Account has not been verified, check your inbox for verification code..."
      );
    }

    const otpDetails = {
      email,
      subject: "Password reset",
      message: "Enter the code below to reset your password",
      duration: 20,
    };

    const createdOtp = await sendOTP(otpDetails);
    return createdOtp;
  } catch (error) {
    throw error;
  }
};

// verify reset password OTP
const resetUserPassword = async ({ email, newPassword, OTP }) => {
  try {
    const validOTP = await verifyOTP({ email, OTP });

    if (!validOTP) {
      throw Error(
        "Incorrect OTP, please check your inbox and input the right OTP..."
      );
    }

    // Update new password
    if (newPassword.length < 6) {
      throw Error("Password is too short and not strong enough...");
    }

    const hashNewPassword = await bcrypt.hash(newPassword, 10);
    await userModel.updateOne({ email }, { password: hashNewPassword });

    await deleteOtp(email);
    return;
  } catch (error) {
    throw Error;
  }
};



// const newUserPassword = async({newPassword, OTP});
// try {
//   const checkOTP = await verifyOTP({ OTP });

//   if (!checkOTP) {
//     throw Error("Incorrect OTP, please input the correct OTP....");
//   }

//   const checkUser = await userModel.findById(req.params.id)
//   if(!checkUser){
//     throw Error("This user does not exist....")
//   }
//   // Update new password
//   if (newPassword.length < 6) {
//     throw Error("Password is too short and not strong enough...");
//   }

//   const hashNewPassword = await bcrypt.hash(newPassword, 10);
//   await userModel.updateOne(
//     { id },
//     { password: hashNewPassword },
//     { new: true }
//   );

//   await deleteOtp(email);
//   return;
// } catch (error) {
//   throw Error;
// }




module.exports = {
  verifyUserEmail,
  sendPasswordResetOTPEmail,
  verifyOTP,
  sendOTP,
  resetUserPassword,
};
