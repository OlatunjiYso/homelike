const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../Model/user');
const { Apartment } = require('../Model/apartment');
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
        if (emailTaken) return conflictRegResponse();
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        user.password = hashedPassword;
        const newUser = new User(user);
        await newUser.save();
        newUser.password = null; //knockOff password.
        return successfulRegResponse(newUser);
    }
    catch (err) {
        return serverErrorResponse(err.message);
    }
}
/**
 * @description A Resolver method for authenticating users.
 * @param {*} credentials - user claims.
 * @returns Object.
 */
const authenticate = async (credentials) => {
    const { password, email } = credentials;
    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) return failedAuthResponse();
        const hash = existingUser.password;
        const passwordIsValid = await bcrypt.compare(password, hash);
        if (!passwordIsValid) return failedAuthResponse();
        return successfulAuthResponse(existingUser);
    }
    catch (err) {
        return serverErrorResponse(err.message);
    }
}
/**
 * @description A Resolver method to add an apartment to a users list of favorites.
 * @param {ID} userId - Id of interested user.
 * @param {ID} apartmentId - Id of favorite Apartment
 * @returns Object
 */
const addToFavorites = async (ids) => {
    const { userId, apartmentId } = ids;
    try {
        const validId = checkIDValid(apartmentId);
        if (!validId) return inValidIDResponse();
        const user = await User.findById(userId);
        if (!user) return notFoundSpecifedUserResponse();
        const validApartment = await verifyApartment(apartmentId);
        if (!validApartment) return inValidFavoriteResponse();
        const hasBeenAddedPreviously = await favoriteDuplicateCheck(user, apartmentId);
        if (hasBeenAddedPreviously) return duplicateFavoriteResponse();
        let { favorites } = user;
        favorites.push(validApartment);
        let updatedUser = await User.findOneAndUpdate({ _id: userId }, { favorites }, { new: true});
        return successfulAddFavoriteResponse(updatedUser);
    } catch (err) {
        return serverErrorResponse(err.message);
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
        if (!validId) return inValidIDResponse();
        const user = await User.findById(userId)
        if (!user) return notFoundSpecifedUserResponse();
        return foundSpecifedUserResponse(user)
    } catch (err) {
        return serverErrorResponse(err.message);
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

/**
 * An Helper method to check if suppliedID is a valid MongoDB ID
 * @param {ID} id 
 * @returns 
 */
const checkIDValid = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
}


// Responses sent back to Resolver.
const failedAuthResponse = () => ({
    success: false,
    statusCode: '401',
    message: 'Incorrect Email or password',
    user: null
});
const successfulAuthResponse = (user) => ({
    success: true,
    statusCode: '200',
    message: 'Login successful',
    user
});
const conflictRegResponse = () => ({
    success: false,
    statusCode: '409',
    message: 'The email has been taken',
});
const successfulRegResponse = (user) => ({
    success: true,
    statusCode: '201',
    message: 'Signup successful',
    user
});
const inValidFavoriteResponse = () => ({
    success: false,
    statusCode: '403',
    message: 'No apartment with the specified ID exists'
});
const duplicateFavoriteResponse = () => ({
    success: false,
    statusCode: '403',
    message: 'You already have this apartment in your list of favorites'
});
const successfulAddFavoriteResponse = (user) => ({
    success: true,
    statusCode: '200',
    message: 'Favorited apartment added successfully.',
    user
});
const foundSpecifedUserResponse = (user) => ({
    success: true,
    statusCode: '200',
    message: 'user found',
    user
});
const notFoundSpecifedUserResponse = () => ({
    success: false,
    statusCode: '404',
    message: 'user with specified id not found',
});

const inValidIDResponse = (errorMessage) => ({
    success: false,
    statusCode: '400',
    message: 'The Supplied ID cannot be cast to Object ID, please ensure that you are using a valid ID',
    errorMessage
});
const serverErrorResponse = (errorMessage) => ({
    success: false,
    statusCode: '501',
    message: 'Internal Server error',
    errorMessage
});






module.exports = { addUser, authenticate, addToFavorites, findSpecifiedUser };