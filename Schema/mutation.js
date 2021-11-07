const graphql = require('graphql');
const { UserRegistrationResponse, AddFavoriteResponse, AddApartmentResponse } = require('./types');
const { addUser, addToFavorites } = require('../Services/user');
const { addNewApartment } = require('../Services/apartment');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLFloat
} = graphql;

const rootMutation = new GraphQLObjectType({
    name: 'rootMutation',
    fields: {
        addUser: {
            type: UserRegistrationResponse,
            args: {
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                lastName: { type: new GraphQLNonNull(GraphQLString) },
                email: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(parent, args){
                const res = await addUser(args)
                const { statusCode, success, message, user, errorMessage, jwt } = res;
                return { response: {statusCode, success, message, errorMessage}, user, jwt }
            }
        },
        addApartment: {
            type: AddApartmentResponse,
            args: {
                description: { type: GraphQLString },
                rooms: { type: new GraphQLNonNull(GraphQLInt) },
                country: { type: new GraphQLNonNull(GraphQLString) },
                city: { type: new GraphQLNonNull(GraphQLString) },
                lng: { type: new GraphQLNonNull(GraphQLFloat) },
                lat: { type: new GraphQLNonNull(GraphQLFloat) },
            },
            async resolve(parent, args, context){
                const res = await addNewApartment(args, context);
                const { statusCode, success, message, apartment,errorMessage } = res;
                return { response: { statusCode, success, message, errorMessage }, apartment }
            }
        },
        addFavorite: {
            type: AddFavoriteResponse,
            args: {
                apartmentId: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(parent, args, context){
               const res = await addToFavorites(args, context)
               const { statusCode, success, message, user, errorMessage } = res;
               return { response: { statusCode, success, message, errorMessage }, user }
            }
        }
    }
});


module.exports = rootMutation;