const express = require("express")
const authController = require("../controllers/authController")
const verifyToken = require("../middleware/verify")

const router = express.Router()



router.route("/sign-up").post(authController.signUp )
router.route("/login").post(authController.login)
router.route("/forgot-password-otp").post(authController.forgotPassword)
router.route("/password-reset-verification").post(authController.passwordReset)





module.exports = router