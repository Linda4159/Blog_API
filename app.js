const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const cors = require("cors")
const morgan = require("morgan");
const compression = require("compression")
const AppError = require("./utils/appError")
const globalErrorHandler = require("./controllers/errorController")
const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes")
const OtpRouter = require("./routes/otpRoutes");
const checkoutRouter = require("./routes/checkoutRoutes");




// middleware
const logger = (req, res, next) => {
  console.log("hello from the middleware👋");
  next();
}



const app = express();

app.use(express.json());
app.use(cors())

if(process.env.NODE_ENV === "development"){
   app.use(morgan("dev"));
}

app.use(logger)

app.set("view engine", " ejs")

app.use(compression())

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});




app.get("/", (req, res) => {
  res.send("api is ready");
});

app.get("/payment", (req, res) => {
  res.render("index.ejs");
});


app.post("/checkout" ,async(req,res)=>{
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data:{
            name:"Payment for blogs"
          },
          unit_amount: 50 * 100
        },
        quantity:1
      },
      {
        price_data: {
          currency: "usd",
          product_data:{
            name:"Bloggers Alliance"
          },
          unit_amount: 20 * 100
        },
        quantity:2
      }
    ],
    mode : "payment",
    shipping_address_collection:{
      allowed_countries:["US","NG"]
    },
    success_url: `${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`, 
    cancel_url: `${process.env.BASE_URL}/cancel`,
  })
  res.redirect(session.url)
})

app.get("/success",async (req,res)=>{

  const result = Promise.all([
    stripe.checkout.sessions.retrieve(req.query.session_id, {expand:["payment_intent.payment_method"]}),
    stripe.checkout.sessions.listLineItems(req.query.session_id)
  ])

  console.log(JSON.stringify(await result))
  res.send("Your payment was successfull...")
})

app.get("/cancel",(req,res)=>{
  res.redirect("/payment")
})







// app.get("/paystack",(req,res)=>{
//   const https = require('https')

// const params = JSON.stringify({
//   "email": "customer@email.com",
//   "amount": "20000"
// })

// const options = {
//   hostname: 'api.paystack.co',
//   port: 443,
//   path: '/transaction/initialize',
//   method: 'POST',
//   headers: {
//     Authorization:`Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//     'Content-Type': 'application/json'
//   }
// }

// const reqPaystack = https.request(options, resPaystack => {
//   let data = ''

//   resPaystack.on('data', (chunk) => {
//     data += chunk
//   });

//   resPaystack.on('end', () => {
//     res.send(data)
//     console.log(JSON.parse(data))
//   })
// }).on('error', error => {
//   console.error(error)
// })

// reqPaystack.write(params)
// reqPaystack.end()
// })

app.use("/api/v1/blogs", postRouter);
app.use("/api/v1/users", userRouter)
app.use("/api/v1/otp",OtpRouter)
app.use("/api/v1/checkout",checkoutRouter)



app.all("*", (req, res, next) => {

  next(new AppError(`Can't reach ${req.originalUrl} on this server!!!`,404));
});

app.use(globalErrorHandler);

module.exports = app;
