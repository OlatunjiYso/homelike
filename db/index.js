const mongoose = require('mongoose');
const { dbUrl, environment } = require('./config');

const connect = () => {
    mongoose.connect(dbUrl, null, (err) => {
        if (err) {
            console.log(`An error occured while connecting to db on ${environment} environment`, err)
        }
    });
}
const disconnect = () => { mongoose.connection.close() }
module.exports = { connect, disconnect }