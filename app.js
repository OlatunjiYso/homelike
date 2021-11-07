const express = require('express');
const { graphqlHTTP }= require('express-graphql');
const cors = require('cors');
const dotenv = require('dotenv');

const schema = require('./Schema/index');
const db = require('./db')
dotenv.config();
db.connect();
const port = process.env.PORT || 5085;
const app = express();
app.use(cors());

const context =(req) => {
  let healthCheck = true
  const headers = req.headers;
  return { healthCheck, headers}
};

app.use('/graphql', graphqlHTTP( req => ({
  schema,
  graphiql: true,
  context: context(req)
})));



app.listen(port, ()=> {
  console.log(`Listening on port ${port}`)
});

process.on('SIGINT', () => {
    console.warn('Shutting down server...');
    db.disconnect() // properly close db connection
    console.log('Server successfully shutdown');
    process.exit(0);
  });