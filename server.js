const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION!!! Shutting down...");
    process.exit(1)
});



dotenv.config({ path: "./.env" });

const connectDB = require("./db/db");
connectDB();

const app = require("./app");

console.log(app.get("env"))
// console.log(process.env);

const port = process.env.PORT || 9955;

const server = app.listen(port, () => {
  console.log(`server running on port : ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION!!! Shutting down...");
  server.close(() => {
    process.exit(1);
  });
});


