const graphql =  require('graphql');
const rootMutation = require('./mutation');
const rootQuery = require('./query');

const { GraphQLSchema } = graphql;

const rootSchema = new GraphQLSchema({
    query: rootQuery,
    mutation: rootMutation
});


module.exports = rootSchema;