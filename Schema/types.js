const graphql = require('graphql');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLInt,
    GraphQLBoolean,
    GraphQLFloat,
    GraphQLList
} = graphql;

const User = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        favorites: {
            type: new GraphQLList(Apartment),
            resolve(parent, args) {
                const { favorites } = parent;
                return favorites;
            }
        }
    })
});
const Geometry = new GraphQLObjectType({
    name: 'Geometry',
    fields: () => ({
        type: { type: GraphQLString },
        coordinates: { type: new GraphQLList(GraphQLFloat) }
    })
});
const Apartment = new GraphQLObjectType({
    name: 'Apartment',
    fields: () => ({
        id: { type: GraphQLID },
        description: { type: GraphQLString },
        rooms: { type: GraphQLInt },
        country: { type: GraphQLString },
        city: { type: GraphQLString },
        lng: { type: GraphQLFloat },
        lat: { type: GraphQLFloat },
        geometry: { type: Geometry},
        addedBy: { 
            type: User,
            resolve(parent, args) {
                const { addedBy } = parent;
                return addedBy;
            }
        }
    })
});
const BaseResponse = new GraphQLObjectType({
    name: 'BaseResponse',
    fields: () => ({
        success: { type: GraphQLBoolean },
        statusCode: { type: GraphQLString },
        message: { type: GraphQLString },
        errorMessage: { type: GraphQLString }
    })
});
const UserRegistrationResponse = new GraphQLObjectType({
    name: 'UserRegistrationResponse',
    fields: () => ({
        response: { type: BaseResponse },
        user: { type: User },
        jwt: { type: GraphQLString }
    })
});
const AddApartmentResponse = new GraphQLObjectType({
    name: 'AddApartmentResponse',
    fields: () => ({
        response: { type: BaseResponse },
        apartment: { type: Apartment }
    })
});
const AddFavoriteResponse = new GraphQLObjectType({
    name: 'AddFavoriteResponse',
    fields: () => ({
        response: { type: BaseResponse },
        user: { type: User }
    })
});
const AuthenticationResponse = new GraphQLObjectType({
    name: 'AuthenticationResponse',
    fields: () => ({
        response: { type: BaseResponse },
        user: { type: User },
        jwt: { type: GraphQLString }
    })
});
const SpecifiedUserResponse = new GraphQLObjectType({
    name: 'SpecifiedUserResponse',
    fields: () => ({
        response: { type: BaseResponse },
        user: { type: User }
    })
});
const SpecifiedApartmentResponse = new GraphQLObjectType({
    name: 'SpecifiedApartmentResponse',
    fields: () => ({
        response: { type: BaseResponse },
        apartment: { type: Apartment },
    })
});
const ApartmentSearchResponse = new GraphQLObjectType({
    name: 'ApartmentSearchResponse',
    fields: () => ({
        response: { type: BaseResponse },
        apartments: { type: new GraphQLList(Apartment) },
    })
});

module.exports = {
    UserRegistrationResponse,
    AddApartmentResponse,
    AddFavoriteResponse,
    AuthenticationResponse,
    SpecifiedUserResponse,
    SpecifiedApartmentResponse,
    ApartmentSearchResponse
};