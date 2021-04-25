const express = require('express');
const router = express.Router(); // router for adding routes
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas.js');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

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

// Basic routes for the router
// campground/index
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({}) // find all camps in the db
    res.render('campgrounds/index', { campgrounds })
}));
// campground CREATE route\
// this route must be declared before /campgroudns/:id
// otherwise new will be treated as :id 
router.get('/new', (req, res) => {
    res.render('campgrounds/new')
});
// post route to save a new campground
router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground); // create a new db entry from the form post request
    await campground.save();
    req.flash('success', 'Successfully added a new campground!');
    res.redirect(`/campgrounds/${campground._id} `);
}));
// campground SHOW route
router.get('/:id', catchAsync(async(req, res) => {
    const campground = await (await Campground.findById(req.params.id).populate('reviews'))
    // populate is used to populate reviews in campground with actual data
    // if campground not found flash error and redirect
    if(!campground){
        req.flash("error", "Cannot find that campground.");
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));
// campground EDIT route
router.get('/:id/edit', catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id) // find the camp by id passed in the parameters of the request   
    res.render('campgrounds/edit', { campground });
}));
// route handling the from request to edit the camp
// middleware is passed before the main function on the path
router.put('/:id', validateCampground, catchAsync(async(req,res) => {
    const { id } = req.params; // id is sent in the request parameters
    // req body holds contents of the form
    // use spread operator (...) to spread the campground object
    // into the db model object
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    req.flash("success", "Successfully updated campground!")
    // redirect to the just edited object
    res.redirect(`/campgrounds/${campground._id}`)
}));

// camp DELETE route
router.delete('/:id', catchAsync(async(req, res) =>{
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Campground deleted")
    res.redirect('/campgrounds');
}));

module.exports = router;