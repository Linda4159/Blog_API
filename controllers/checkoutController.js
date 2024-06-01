const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const express = require("express")
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const globalErrorHandler = require("./errorController");
const postModel = require("../models/postModel");
const userModel = require("./../models/userModel")
const https = require('https');


// exports.getCheckoutSession = catchAsync(async(req,res,next)=>{

//   const blog = await postModel.findById(req.params.blogID)

//  const session = await stripe.checkout.sessions.create({
//     payement_method_types :  ["card"],
//     success_url: "http://localhost:4114/success", 
//     cancel_url: "http://localhost:4114/cancel",
//     customer_email :req.user.email,
//     client_reference_id : req.params.blogID ,
//     line_items: [
//         {
//             name : `${blog.title} Blog`,
//             description: blog.body,
//             images: blog.blogCover,
//             amount: blog.price * 100,
//             currency: "usd",
//             quantity: 1
//         }
//     ]
//   })
// res.status(200).json({
//     status:"success",
//     session
// })

    
// })



const payStack = {

    acceptPayment: async(req, res) => {
      try {
        // request body from the clients
        const email = req.body.email;
        const amount = req.body.amount;
        // params
        const params = JSON.stringify({
          "email": email,
          "amount": amount * 100
        })
        // options
        const options = {
          hostname: 'api.paystack.co',
          port: 443,
          path: '/transaction/initialize',
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // where you place your secret key copied from your dashboard
            'Content-Type': 'application/json'
          }
        }
        // client request to paystack API
        const clientReq = https.request(options, apiRes => {
          let data = ''
          apiRes.on('data', (chunk) => {
            data += chunk
          });
          apiRes.on('end', () => {
            console.log(JSON.parse(data));
            return res.status(200).json(data);
          })
        }).on('error', error => {
          console.error(error)
        })
        clientReq.write(params)
        clientReq.end()
        
      } catch (error) {
        // Handle any errors that occur during the request
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
      }
    },
  }
  
  const initializePayment = payStack;
  module.exports = initializePayment;