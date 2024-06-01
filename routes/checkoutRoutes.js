const express = require("express")
const authController = require("../controllers/authController")
const initializePayment = require("../controllers/checkoutController")
const verifyToken = require("../middleware/verify")






const router = express.Router()


// router.get("/checkout-session/:blogID",verifyToken, checkoutController.getCheckoutSession )




router.post('/acceptpayment', initializePayment.acceptPayment);







module.exports = router

