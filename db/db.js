const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    const connect = await mongoose.connect(process.env.URL);
    console.log("database connection successful");
  } catch (error) {
    console.log(error, "error in database connection");
  }
};
module.exports = connectDB;
