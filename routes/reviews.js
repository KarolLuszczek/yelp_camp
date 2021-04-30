const express = require('express');
// Express keeps separate parameters for routers.
// Use mergeParams to access all params on the route
// we need it to get :id from the route (defined in app.js)
const router = express.Router({mergeParams: true}); // router for adding routes
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');
const catchAsync = require('../utils/catchAsync');
const reviews = require('../controllers/reviews');

// middleware valdiateReview before the reivew is added to the database
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.destroyReview));

module.exports = router;