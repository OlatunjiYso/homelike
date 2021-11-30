const { Apartment } = require('../Model/apartment');
const { verifyUser, checkIDValid } = require('./helper');
/**
 * @description A Resolver method to add new apartments
 * @param {Object} apartment - Apartment details
 * @returns {Object}
 */
const addNewApartment = async (apartment, context) => {
    try {
        const encodedUser = verifyUser(context);
        if(!encodedUser) return apartmentServiceResponse(false, '401', 'login to continue', null, null, '')
        const { userId } = encodedUser;
        const { lng, lat, city, country } = apartment;
        apartment.city = city.toLowerCase();
        apartment.country = country.toLowerCase();
        apartment.addedBy = userId;
        const isValidCoordinates = validateCoordinates([lng, lat]);
        if (!isValidCoordinates) return apartmentServiceResponse(false, '400', 'invalid coodinates', null, null, '')
        const geometry = { type: 'Point', coordinates: [lng, lat] };
        apartment.geometry = geometry;
        const newApartment = new Apartment(apartment);
        const res = await newApartment.save();
        const populated = Apartment.findById(res.id).populate('addedBy');
        return apartmentServiceResponse(true, '201', 'apartment added', populated, null, '')
    }
    catch (err) {
        return apartmentServiceResponse(false, '503', 'internal server error', null, null, err.message)
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
        return apartmentServiceResponse(true, '200', '', null, apartments, '')
    }
    catch (err) {
        return apartmentServiceResponse(false, '503', 'internal server error', null, null, err.message)
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
        if (!validId) return apartmentServiceResponse(false, '400', 'invalid ID', null, null, '');
        const apartment = await Apartment.findById(apartmentId)
            .populate('addedBy');
        if (!apartment) return apartmentServiceResponse(false, '404', 'apartment not found', null, null, err)
        return apartmentServiceResponse(true, '200', 'apartment found', apartment, null, '')
    }
    catch (err) {
        return apartmentServiceResponse(false, '503', 'internal server error', null, null, err.message)
    }
}


// HELPERS //
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

/**
 * @desc a method to return service response
 * @param {boolean} success 
 * @param {string} statusCode 
 * @param {string} message 
 * @param {Apartment} apartment 
 * @param {Apartmnet[]} apartments 
 * @param {string} err 
 * @returns  {object}
 */
const apartmentServiceResponse = (success, statusCode, message, apartment, apartments, err) => ({
    success,
    statusCode,
    message,
    apartment,
    apartments,
    errorMessage: err
});

module.exports = { addNewApartment, fetchApartments, fetchSpecifiedApartment };