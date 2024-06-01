const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    trim:true
  },
  email: {
    type: String,
    require: true,
    unique: true,
    trim:true
  },
  password: {
    type: String,
    require: true,
    trim:true,
    minLength : 8,
    select: false
  },
  role: {
    type: String,
    enum: ["author", "reader", "admin"],
    default:"reader"
  },
  token:{
    type:String
  },
  verified:{
    type:Boolean,
    default : false
  },
  createdAt:{
    type:Date,
    default: new Date(),
  }
});

module.exports = mongoose.model("user",userSchema)