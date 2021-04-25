const express = require('express');
// Express keeps separate parameters for routers.
// Use mergeParams to access all params on the route
// we need it to get :id from the route (defined in app.js)
const router = express.Router({mergeParams: true}); // router for adding routes

const Campground = require('../models/campground');
const Review = require('../models/review');
const { reviewSchema } = require('../schemas.js')

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
 
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

// middleware valdiateReview before the reivew is added to the database
router.post('/', validateReview, catchAsync(async(req, res) =>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save(); // should be done in parallel (awaiting)
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:reviewId', catchAsync(async (req, res) =>{
    const {id, reviewId } = req.params; // destructuring request parameters
    Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId}}) // $pull operator removes all instances that match reviewId from an array reviews
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`)
}));

module.exports = router;