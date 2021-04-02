// Mongoose model for the campground
const mongoose = require('mongoose');
const Schema = mongoose.Schema; // a little shortcut for schema object

const CampgroundSchema = new Schema({
    title: String,
    price: String,
    description: String,
    location: String
});

// make the model importable by the main application
module.exports = mongoose.model('Campground', CampgroundSchema) 