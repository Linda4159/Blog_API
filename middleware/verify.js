const { promisify } = require("util");
const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const jwt = require("jsonwebtoken");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const userModel = require("../models/userModel");

const verify = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }
  // console.log(token)
  if (!token) {
    const error = new AppError(
      "You are not logged in!!! Please log in to gain access",
      401
    );
    next(error);
  }

  //   verify users token
  const verifyToken = await promisify(jwt.verify)(token, process.env.TOKEN_KEY);
  //   console.log(verifyToken);

  // check if user exist
  const user = await userModel.findById(verifyToken.id);

  if (!user) {
    const error = new AppError(
      "This user with the given token does no longer exist",
      401
    );
    next(error);
  }

  req.user = user;
  next();
});

// const verifyToken = async(req,res,next)=>{
//     const token = req.body.token || req.query.token || req.headers.authorization

//     // check if token exist
//     if(!token){
//         // return res.status(403).json({message:"An authentication token is required..."})
//         const error = new AppError ("An authentication token is required...", 401)

//         return next(error)
//     }
//      await jwt.verify(token,process.env.TOKEN_KEY,(err,payload)=>{
//         if(err){
//             // return res.status(403).json({message:"Wrong or Invalid token,Please login again..."})

//         const error = new AppError ("Wrong or Invalid token,Please login again...", 401)

//         return next(error)

//         }else{
//             req.user = payload
//         }
//         next()

//     })
// }
module.exports = verify;
