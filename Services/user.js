const bcrypt = require('bcrypt');
const User = require('../Model/user');
const { Apartment } = require('../Model/apartment');
const { verifyUser, checkIDValid, generateJwt } = require('./helper');
const { getNullableType } = require('graphql');
const saltRounds = 10;
/**
 * @description A Resolver method for registering a new user
 * @param {Object} user - user details
 * @returns Object
 */
const addUser = async (user) => {
    const { email, password } = user;
    try {
        const emailTaken = await findExistingUser(email);
        if (emailTaken) return userServiceResponse(false, '409', 'Email taken', null, null, '')
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        user.password = hashedPassword;
        const createdUser = await new User(user).save();
        let token = generateJwt(createdUser)
        return userServiceResponse(true, '201', 'signup successful', createdUser, token, '');
    }
    catch (err) {
        return userServiceResponse(false, '503', 'internal server err', null, null, err.message);
    }
}
/**
 * @description A Resolver method for authenticating users.
 * @param {*} credentials - user claims.
 * @returns Object.
 */
const authenticate = async (credentials, req) => {
    const { password, email } = credentials;
    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) return userServiceResponse(false, '401', 'invalid email or password', null, null, '');
        const hash = existingUser.password;
        const passwordIsValid = await bcrypt.compare(password, hash);
        if (!passwordIsValid) return userServiceResponse(false, '401', 'invalid email or password', null, null, '');
        const token = generateJwt(existingUser)
        return userServiceResponse(true, '200', 'login successfull', existingUser, token, '')
    }
    catch (err) {
        return userServiceResponse(false, '503', 'internal server error', null, null, err.message);
    }
}
/**
 * @description A Resolver method to add an apartment to a users list of favorites.
 * @param {ID} userId - Id of interested user.
 * @param {ID} apartmentId - Id of favorite Apartment
 * @returns Object
 */
const addToFavorites = async (ids, context) => {
    const { apartmentId } = ids;
    try {
        const encodedUser = verifyUser(context);
        if (!encodedUser) return userServiceResponse(false, '401', 'kindly login to continue', null, null, '');
        const { userId } = encodedUser;
        const validId = checkIDValid(apartmentId);
        if (!validId) return userServiceResponse(false, '400', 'invalid ID', null, null, '')
        const user = await User.findById(userId);
        const validApartment = await verifyApartment(apartmentId);
        if (!validApartment) return userServiceResponse(false, '403', 'invalid Apartment', null, null, '')
        const hasBeenAddedPreviously = await favoriteDuplicateCheck(user, apartmentId);
        if (hasBeenAddedPreviously) return userServiceResponse(false, 'you have added this apartment already', null, null, '');
        const { favorites } = user;
        favorites.push(validApartment);
        const updatedUser = await User.findOneAndUpdate({ _id: userId }, { favorites }, { new: true });
        return userServiceResponse(true, '200', 'favorites added', updatedUser, null, '')
    } catch (err) {
        return userServiceResponse(false, '503', 'internal server error', null, null, err.message);
    }
}
/**
 * @description The Resolver method for finding a specified User. 
 * @param {ID} userId 
 * @returns {Object}
 */
const findSpecifiedUser = async (userId) => {
    try {
        const validId = checkIDValid(userId);
        if (!validId) return userServiceResponse(false, '403', 'Invalid ID', null, null, '');
        const user = await User.findById(userId)
            .populate({
                path: 'favorites',
                populate: {
                    path: 'addedBy',
                    model: 'user'
                }
            })
        if (!user) return userServiceResponse(false, '404', 'user not found', null, null, '');
        return userServiceResponse(true, '200', 'user found', user, null, '');
    } catch (err) {
        return userServiceResponse(false, '503', 'internal server error', null, null, err.message);
    }
}
/**
 * Helper Method to check if a user with specified Email exists
 * @param {email} email 
 * @returns User
 */
const findExistingUser = async (email) => {
    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) return null;
        return existingUser;
    } catch (err) {
        console.log(err.message)
    }
}
/**
 *  Helper Method to check if an Apartment with specified ID exists
 * @param {ID} apartmentId 
 * @returns Apartment
 */
const verifyApartment = async (apartmentId) => {
    try {
        const validId = checkIDValid(apartmentId);
        if (!validId) return null;
        const apartment = await Apartment.findById(apartmentId);
        if (!apartment) return null;
        return apartment;
    }
    catch (err) {
        console.log(err.message)
    }
}
/**
 * Helper Method to check if a user has already added a favorite apartment
 * @param {ID} apartmentId 
 * @returns 
 */
const favoriteDuplicateCheck = async (user, apartmentId) => {
    let result = false;
    try {
        const userFavorites = user.favorites;
        if (userFavorites.length === 0) return result;
        for (let i = 0; i < userFavorites.length; i++) {
            if (userFavorites[i].id == apartmentId) {
                result = true; break;
            }
        }
        return result;
    }
    catch (err) {
        console.log(err.message)
    }
}

const userServiceResponse = (success, statusCode, message, user, jwt, err) => {
    return {
        success,
        statusCode,
        message,
        user,
        jwt,
        errorMessage: err
    }
}

module.exports = { addUser, authenticate, addToFavorites, findSpecifiedUser };