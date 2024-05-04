const express = require("express")
const otpController = require("../controllers/otpController")



const router = express.Router()

router.route("/").post(otpController.otpAccess)
router.route("/verify-otp/:id").post(otpController.verifyNewOtp)
router.route("/send-email-otp").post(otpController.verifyEmailOtp)
router.route("/verify-email-otp").post(otpController.emailVerification)






module.exports = router