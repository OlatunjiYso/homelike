const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pointSchema = Schema({
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  });
const ApartmentSchema = new Schema({
    description: { type: String },
    rooms: { type: Number, default: 1 },
    country: { type: String },
    city: { type: String },
    geometry: {
        type: pointSchema,
        required: true,
        index: '2dsphere'
    },
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
});

const Apartment = mongoose.model('apartment', ApartmentSchema);
module.exports = { Apartment, ApartmentSchema };