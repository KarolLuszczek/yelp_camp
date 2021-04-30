const express = require('express');
const router = express.Router(); // router for adding routes
const Campground = require('../models/campground');
const campgrounds = require('../controllers/campgrounds')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const catchAsync = require('../utils/catchAsync');

// Basic routes for the router
// campground/index
router.get('/', catchAsync(campgrounds.index));
// campground CREATE route\
// this route must be declared before /campgroudns/:id
// otherwise new will be treated as :id 
router.get('/new', isLoggedIn, campgrounds.renderNewForm);
// post route to save a new campground
router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));
// campground SHOW route
router.get('/:id', catchAsync(campgrounds.showCampground));
// campground EDIT route
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));
// route handling the from request to edit the camp
// middleware is passed before the main function on the path
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

// camp DELETE route
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.destroyCampground));

module.exports = router;