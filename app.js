const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const { campgroundSchema, reviewSchema } = require('./schemas.js')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');

const campgrounds = require('./routes/campgrounds');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}) // hardcoded for early development

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
////////////////////////////////////
const app = express();

app.engine('ejs', ejsMate); // use ejs-mate ejs engine
app.set('view engine', 'ejs'); // Using ejs templates
app.set('views', path.join(__dirname, 'views')); // set a relative path to /views

// tell express to prase requests body
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // to Override query methods in forms (to send other request than POST or GET from HTML forms)

// Specify routers
app.use('/campgrounds', campgrounds) // first arugment defines the prefix for all routes in campgrounds router

//middleware function to validate review form
const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',') //for each element in the error array, join it into one string on a comma
        throw new ExpressError(msg, 400)
    } else {
        next();
    }     
};

app.listen(3000, ()=> {
    console.log('serving on port 3000')
});

app.get('/', (req, res) => {
    res.render('home') // with relative path it goes to views/home.ejs
});


// middleware valdiateReview before the reivew is added to the database
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req, res) =>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save(); // should be done in parallel (awaiting)
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) =>{
    const {id, reviewId } = req.params; // destructuring request parameters
    Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId}}) // $pull operator removes all instances that match reviewId from an array reviews
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`)
}));

// for all paths unresolved up to this point
app.all('*', (req, res, next) =>{
    next(new ExpressError(("Page Not Found"), 404))
});

app.use((err, req, res, next) => {
    //const { statusCode = 500, message = "Something went wrong!" } = err; //destructing statusCode and message from error. Defualts assigned if these attributes are not matched.
    if(!err.message) err.message = "Oh no! Something went wrong!"
    if(!err.statusCode) err.statusCode = 500
    res.status(err.statusCode).render('error', { err }); //sends a response with a statusCode and a message
});
