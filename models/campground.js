// Mongoose model for the campground
const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema; // a little shortcut for schema object

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    image: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
   // deleted documents by findOneAndDelete will be passed to the async function
   if(doc){
       // delete all reviews whose _id field was in the deleted campground
       // reviews array
       await Review.deleteMany({
           _id : {
               $in: doc.reviews
           }
       })
   }
})
// make the model importable by the main application
module.exports = mongoose.model('Campground', CampgroundSchema) 