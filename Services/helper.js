const mongoose = require('mongoose');
const dotenv = require('dotenv');
var jwt = require('jsonwebtoken');
dotenv.config();
const jwtSecret = process.env.JWT_SECRET

/**
 * An Helper method to check if suppliedID is a valid MongoDB ID
 * @param {ID} id 
 * @returns 
 */
const checkIDValid = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
}
/**
 * @description An Helper method to Verify JWT
 * @param {context} context  application context
 * @returns 
 */
const verifyUser = (context) => {
    if (!context.request.headers) return null;
    if (!context.request.headers.authorization) return null;
    let token = context.request.headers.authorization;
    if (!token) return null;
    token = token.split(' ')[1];
    try {
        const decoded = jwt.verify(token, jwtSecret);
        return decoded
    } catch (err) {
        return null;
    }
}
/**
 * @decription An helper to generate JWT.
 * @param {user} user 
 * @returns 
 */
const generateJwt = (user) => {
    //Generate token that expires in 10 hours.
    const token = jwt.sign({userId: user.id  }, jwtSecret, { expiresIn: 60 * 60 * 10 });
    return token
}

module.exports = { verifyUser, checkIDValid, generateJwt };