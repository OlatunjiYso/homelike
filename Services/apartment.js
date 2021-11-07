const mongoose = require('mongoose');
const { Apartment } = require('../Model/apartment');

/**
 * @description A Resolver method to add new apartments
 * @param {Object} apartment - Apartment details
 * @returns {Object}
 */
const addNewApartment = async (apartment) => {
    try {
        const { lng, lat, city, country } = apartment;
        apartment.city = city.toLowerCase();
        apartment.country = country.toLowerCase();
        const isValidCoordinates = validateCoordinates([lng, lat]);
        if (!isValidCoordinates) return inValidCoordinateResponse();
        const geometry = { type: 'Point', coordinates: [lng, lat] };
        apartment.geometry = geometry;
        const newApartment = new Apartment(apartment);
        const res = await newApartment.save();
        const populated = Apartment.findById(res.id).populate('addedBy');
        return addApartmentSuccessResponse(populated)
    }
    catch (err) {
        return serverErrorResponse(err.message)
    }
}
/**
 * @description A Resolver method to Search for apartments
 * @param {Object} filters - Set of params used in filtering apartments
 * @returns {Object}
 */
const fetchApartments = async (filters) => {
    const searchFilter = generateSearchFilter(filters);
    try {
        const apartments = await Apartment.find(searchFilter)
            .populate('addedBy');
        return apartmentSearchResponse(apartments)
    }
    catch (err) {
        return serverErrorResponse(err.message);
    }
}

/**
 * @description - A Resolver Method to Find a specific Apartment by ID
 * @param {ID} apartmentId 
 * @returns Object
 */
const fetchSpecifiedApartment = async (apartmentId) => {
    try {
        const validId = checkIDValid(apartmentId);
        if (!validId) return inValidIDResponse();
        const apartment = await Apartment.findById(apartmentId)
            .populate('addedBy');
        if (!apartment) return specifedApartmentNotFoundResponse();
        return specifedApartmentFoundResponse(apartment);
    }
    catch (err) {
        return serverErrorResponse(err.message);
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
/**
 * @description An Helper Method to Validate Coordinates.
 * @param {Array} coordinates Array of coordinates
 * @returns {Boolean}
 */
const validateCoordinates = (coordinates) => {
    const [lng, lat] = coordinates;
    let isValid = true;
    if (lng < -180 || lng > 180) isValid = false;
    if (lat < -90 || lng > 90) isValid = false;
    return isValid;
}
/**
 * @description An Helper Method to generate search filter.
 * @param {Object} options 
 * @returns {Object}
 */
const generateSearchFilter = (options) => {
    let { city, country, rooms, maxDistance } = options;
    const filter = {};
    if (city) filter.city = city.toLowerCase();
    if (country) filter.country = country.toLowerCase();
    if (rooms) filter.rooms = rooms;
    if (maxDistance) {
        filter.geometry = {
            $near: {
                $maxDistance: maxDistance*1000, // Convert meters to KM
                $geometry: { type: "Point", coordinates: [13.404954, 52.520008] }
            }
        }
    }
    return filter;
}



// Responses
const addApartmentSuccessResponse = (apartment) => ({
    success: true,
    statusCode: '201',
    message: 'Appartment successfully added',
    apartment
});
const apartmentSearchResponse = (apartments) => ({
    success: true,
    statusCode: '200',
    message: 'Apartments matching your search',
    apartments
});
const specifedApartmentFoundResponse = (apartment) => ({
    success: true,
    statusCode: '200',
    message: 'Apartment found',
    apartment
});
const specifedApartmentNotFoundResponse = () => ({
    success: false,
    statusCode: '404',
    message: 'Apartment with the specified id not found',
});

const inValidIDResponse = () => ({
    success: false,
    statusCode: '400',
    message: 'The Supplied ID cannot be cast to Object ID, please ensure that you are using a valid ID'
});
const inValidCoordinateResponse = () => ({
    success: false,
    statusCode: '400',
    message: 'The coordinates values entered is invalid. Please Enter a valid coordinate. Latitudes are between -90 and 90 while longitides are between -180 and 180'
})
const serverErrorResponse = (errorMessage) => ({
    success: false,
    statusCode: '501',
    message: 'Internal Server error',
    errorMessage
});


module.exports = { addNewApartment, fetchApartments, fetchSpecifiedApartment };