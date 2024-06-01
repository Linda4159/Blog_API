const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const jwt = require("jsonwebtoken");

// const {TOKEN_KEY , TOKEN_EXPIRY} =process.env

// const createToken = async(tokenData, tokenKey, expiresIn)=>{
//     try {
//         const token = await jwt.sign(tokenData, tokenKey, {expiresIn})

//         return token
//     } catch (error) {
//         throw Error
//     }
// };

const signToken = (id) => {
    return jwt.sign({ id }, process.env.TOKEN_KEY, {
      expiresIn: process.env.TOKEN_EXPIRY,
    });
  };
  


module.exports = signToken