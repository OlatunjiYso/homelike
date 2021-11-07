const express = require('express');
const { graphqlHTTP }= require('express-graphql');
const expressPlayground = require('graphql-playground-middleware-express').default;
const cors = require('cors');
const dotenv = require('dotenv');
const schema = require('./Schema/index');
const db = require('./db')

dotenv.config();
db.connect();
const port = process.env.PORT || 5085;
const app = express();
app.use(cors());
app.use(
  '/graphql',
  graphqlHTTP((request, response, graphQLParams) => ({
      schema: schema,
      context: { 
          request: request, 
          test: 'Example context value'
      }
  }))
);
app.get('/playground', expressPlayground({ endpoint: '/graphql' }));
app.listen(port, ()=> {
  console.log(`Listening on port ${port}`)
});
process.on('SIGINT', () => {
    console.warn('Shutting down server...');
    db.disconnect()
    console.log('Server successfully shutdown');
    process.exit(0);
  });