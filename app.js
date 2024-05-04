const express = require("express");
const morgan = require("morgan");
const AppError = require("./utils/appError")
const globalErrorHandler = require("./controllers/errorController")
const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes")
const OtpRouter = require("./routes/otpRoutes");


// middleware
const logger = (req, res, next) => {
  console.log("hello from the middleware👋");
  next();
}



const app = express();

app.use(express.json());

if(process.env.NODE_ENV === "development"){
   app.use(morgan("dev"));
}

app.use(logger)

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});




app.get("/", (req, res) => {
  res.send("api is ready");
});

app.use("/api/v1/blogs", postRouter);
app.use("/api/v1/users", userRouter)
app.use("/api/v1/otp",OtpRouter)


app.all("*", (req, res, next) => {

  next(new AppError(`Can't reach ${req.originalUrl} on this server!!!`,404));
});

app.use(globalErrorHandler);

module.exports = app;
