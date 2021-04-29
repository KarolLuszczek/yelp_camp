const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const Campground = require('./models/campground');
// Middleware to require login
module.exports.isLoggedIn = (req, res, next) => {
    //console.log("REQ.USER...", req.user); // passport will desrialize the user and put on request data
    // isAuthenticated is a method from passport
    if(!req.isAuthenticated()) {
        // store the url the unlogged user requested
        // save it on session to persist between requests
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You nust be signed in first!')
        res.redirect('/login');
    }
    next();
}

// middleware function to validate forms with Joi
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body) // destruct an error portion only from the validation
    if(error){
        const msg = error.details.map(el => el.message).join(',') //for each element in the error array, join it into one string on a comma
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};

// middelware function for authorization
module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user_id)) {
        req.flash('error','You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};


//middleware function to validate review form
module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',') //for each element in the error array, join it into one string on a comma
        throw new ExpressError(msg, 400)
    } else {
        next();
    }     
};