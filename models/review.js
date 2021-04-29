const mongoose = require('mongoose');
const Schema = mongoose.Schema; // for a shorter code down the line

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model("Review", reviewSchema); // exporting mongoose model