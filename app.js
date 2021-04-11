const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const { campgroundSchema } = require('./schemas.js')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review')

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

// middleware function to validate forms with Joi
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body) // destruct an error portion only from the validation
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

// Basic routes for the app
// campground/index
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({}) // find all camps in the db
    res.render('campgrounds/index', { campgrounds })
}));
// campground CREATE route\
// this route must be declared before /campgroudns/:id
// otherwise new will be treated as :id 
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
});
// post route to save a new campground
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground); // create a new db entry from the form post request
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));
// campground SHOW route
app.get('/campgrounds/:id', catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id) // find the camp by id passed in the parameters of the request
    res.render('campgrounds/show', { campground });
}));
// campground EDIT route
app.get('/campgrounds/:id/edit', catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id) // find the camp by id passed in the parameters of the request
    res.render('campgrounds/edit', { campground });
}));
// route handliugn the from request to edit the camp
// middleware is passed before the main function on the path
app.put('/campgrounds/:id', validateCampground, catchAsync(async(req,res) => {
    const { id } = req.params; // id is sent in the request parameters
    // req body holds contents of the form
    // use spread operator (...) to spread the campground object
    // into the db model object
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    // redirect to the just edited object
    res.redirect(`/campgrounds/${campground._id}`)
}));

// camp DELETE route
app.delete('/campgrounds/:id/', catchAsync(async(req, res) =>{
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

app.post('/campgrounds/:id/reviews', catchAsync(async(req, res) =>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save(); // should be done in parallel (awaiting)
    res.redirect(`/campgrounds/${campground._id}`);
}))
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
