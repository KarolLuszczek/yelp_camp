// Mongoose model for the campground
const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema; // a little shortcut for schema object

const ImageSchema = new Schema({
    url: String,
    filename: String  
});

// virtual property to call cloudinary transfomration api
// we use virtuaal property so that it is not unnecessarily stored
// in the database model
ImageSchema.virtual('thumbnail').get(function() {
    // insert width property to the images cloudinary url
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true }}; // will add virtual when schema is jsonified
const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    // GeoJSON for cooridnates
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    images: [ImageSchema], // images is a list of ImageSchemas
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
}, opts);

// virtual porpery for mapbox popup
CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    // insert width property to the images cloudinary url
    return `<a href="/campgrounds/${this._id}">${this.title}</a>`; // return string literal with an anchor tag
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