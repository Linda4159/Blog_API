const mongoose = require("mongoose")

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        unique:true
    },
    OTP:{
        type:String
    },
    createdAt:{
        type:Date
    },
    expiresAt:{
        type:Date
    },
    duration:{
        type:String,
        default : 60
    }
})
module.exports = mongoose.model("OTP",OTPSchema)