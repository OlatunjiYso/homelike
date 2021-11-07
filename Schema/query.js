const graphql = require('graphql');
const { AuthenticationResponse, SpecifiedUserResponse, SpecifiedApartmentResponse, ApartmentSearchResponse } = require('./types');
const { authenticate, findSpecifiedUser } = require('../Services/user');
const { fetchApartments, fetchSpecifiedApartment } = require('../Services/apartment');


const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
} = graphql;

const rootQuery = new GraphQLObjectType({
    name: 'rootQuery',
    fields: {
        auth: {
            type: AuthenticationResponse,
            args: {
                email: { type: GraphQLString },
                password: { type: GraphQLString },
            },
            async resolve(parent, args, context) {
                const res = await authenticate(args, context);
                const { statusCode, message, success, errorMessage, user, jwt } = res;
                return { response: { statusCode, message, success, errorMessage }, user, jwt };
            }
        },
        user: {
            type: SpecifiedUserResponse,
            args: { userId: { type: GraphQLID } },
            async resolve(parent, args, context) {
                const res = await findSpecifiedUser(args.userId);
                const { statusCode, message, success, errorMessage, user } = res;
                return { response: { statusCode, message, success, errorMessage }, user }

            }
        },
        apartments: {
            type: ApartmentSearchResponse,
            args: {
                rooms: { type: GraphQLInt },
                country: { type: GraphQLString },
                city: { type: GraphQLString },
                lng: { type: GraphQLString },
                lat: { type: GraphQLString },
                maxDistance: { type: GraphQLInt }
            },
            async resolve(parent, args, context) {
                const res = await fetchApartments(args);
                const { statusCode, message, success, apartments, errorMessage } = res;
                return { response: { statusCode, message, success, errorMessage }, apartments }
            }
        },
        apartment: {
            type: SpecifiedApartmentResponse,
            args: { apartmentId: { type: GraphQLID } },
            async resolve(parent, args, context) {
                const res = await fetchSpecifiedApartment(args.apartmentId);
                const { statusCode, message, success, apartment, errorMessage } = res;
                return { response: { statusCode, message, success, errorMessage }, apartment }
            }
        }
    }
});


module.exports = rootQuery;