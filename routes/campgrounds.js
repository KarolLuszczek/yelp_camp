const express = require('express');
const router = express.Router(); // router for adding routes
const Campground = require('../models/campground');
const campgrounds = require('../controllers/campgrounds')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const catchAsync = require('../utils/catchAsync');


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

// campground CREATE route\
// this route must be declared before /campgroudns/:id
// otherwise new will be treated as :id 
router.get('/new', isLoggedIn, campgrounds.renderNewForm);
// post route to save a new campground

router.route('/:id')
    // campground SHOW route
    .get(catchAsync(campgrounds.showCampground))
    // route handling the from request to edit the camp
    // middleware is passed before the main function on the path
    .put( isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    // camp DELETE route
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.destroyCampground))

    // campground EDIT route
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));


module.exports = router;