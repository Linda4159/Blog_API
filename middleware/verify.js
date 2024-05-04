const express = require("express")
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const jwt = require("jsonwebtoken")


// const verify = async(req,res,next)=>{
//      let token;
// if(req.headers.authorization){
// token = req.headers.authorization.split(" ")[1]
// }
// // console.log(token)
// if(!token){
//     return res.status(401).json({message:"You are not logged in!!! Please log in to gain access"})
// }
// const verifyToken = await jwt.verify(token,"myBlog-api-1234567890-desktop",(error,payload)=>{
//     if(error){
//         return res.status(403).json({message:"Wrong or expired token, Please login again!!!"})
//     }else{
//         req.user = payload
//         next()
//     }
//     // console.log(verifyToken)
// })

// }

const verifyToken = async(req,res,next)=>{
    const token = req.body.token || req.query.token || req.headers["x-access-token"]

    // check if token exist
    if(!token){
        return res.status(403).json({message:"An authentication token is required..."})
    }
     await jwt.verify(token,process.env.TOKEN_KEY,(err,payload)=>{
        if(err){
            return res.status(403).json({message:"Wrong or Invalid token,Please login again..."})
        }else{
            req.user = payload
            next()
        }
    })
}
module.exports = verifyToken