const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({

  host: process.env.EMAIL_HOST,
  service: process.env.EMAIL_SERVICE,
  secure: true,
  auth: {
    user: process.env.AUTH_MAIL,
    pass: process.env.AUTH_PASSWORD,
  },
});

// test transporter
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready for messages");
    console.log(success);
  }
});

const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw Error("failed");
  }
};

module.exports = sendEmail;
