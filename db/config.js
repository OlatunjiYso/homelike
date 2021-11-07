const dotenv = require('dotenv');

dotenv.config();
const dbUrls = {
    development: process.env.DEVELOPMENT_DB,
    test: process.env.TEST_DB,
    production: process.env.PRODUCTION_DB
}
const environment = process.env.NODE_ENV;
const dbUrl = dbUrls[environment];
module.exports = {environment, dbUrl}