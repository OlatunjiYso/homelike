const mongoose = require('mongoose');
const { ApartmentSchema } = require('./apartment');

const Schema = mongoose.Schema;
const UserSchema = new Schema({
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    password: { type: String },
    favorites: [ApartmentSchema]
});
const User = mongoose.model('user', UserSchema);

module.exports = User;