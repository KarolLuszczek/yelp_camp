const express = require('express');
const router = express.Router(); // router for adding routes
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const catchAsync = require('../utils/catchAsync');

// Basic routes for the router
// campground/index
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({}) // find all camps in the db
    res.render('campgrounds/index', { campgrounds })
}));
// campground CREATE route\
// this route must be declared before /campgroudns/:id
// otherwise new will be treated as :id 
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new')
});
// post route to save a new campground
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground); // create a new db entry from the form post request
    campground.author = req.user._id;
    console.log(req.user._id)
    await campground.save();
    req.flash('success', 'Successfully added a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));
// campground SHOW route
router.get('/:id', catchAsync(async(req, res) => {
    const campground = await (await Campground.findById(req.params.id).populate('reviews').populate('author'))
    // populate is used to populate reviews in campground with actual data
    // if campground not found flash error and redirect
    if(!campground){
        req.flash("error", "Cannot find that campground.");
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));
// campground EDIT route
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id) // find the camp by id passed in the parameters of the request   
    if (!campground){
        req.flash("error", "Cannot find this campground!");
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}));
// route handling the from request to edit the camp
// middleware is passed before the main function on the path
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async(req,res) => {
    const { id } = req.params; // id is sent in the request parameters
    // req body holds contents of the form
    // use spread operator (...) to spread the campground object
    // into the db model object
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }) // three dots will returns a list of campground fields
    req.flash("success", "Successfully updated campground!")
    // redirect to the just edited object
    res.redirect(`/campgrounds/${campground._id}`)
}));

// camp DELETE route
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async(req, res) =>{
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Campground deleted")
    res.redirect('/campgrounds');
}));

module.exports = router;