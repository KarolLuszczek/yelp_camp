// Campground controllers for MVC pattern
const { cloudinary } = require('../cloudinary');
const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding"); // for mapbox geocoding sdk
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = (async (req, res) => {
    const campgrounds = await Campground.find({}) // find all camps in the db
    res.render('campgrounds/index', { campgrounds })
});

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
};

module.exports.createCampground = async (req, res, next) => {
    // req.files available due to multer
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground); // create a new db entry from the form post request
    campground.geometry = geoData.body.features[0].geometry; // save GeoJSON data
    campground.images = req.files.map(f =>({ url: f.path, filename:f.filename })); // implicit return
    campground.author = req.user._id;
    console.log(req.user._id)
    console.log(campground)
    await campground.save();
    req.flash('success', 'Successfully added a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)};

module.exports.showCampground = async(req, res) => {
    // use path when populating to populate the review and the review author
    const campground = await (await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author'))
    // populate is used to populate reviews in campground with actual data
    // if campground not found flash error and redirect
    if(!campground){
        req.flash("error", "Cannot find that campground.");
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
};

module.exports.renderEditForm = async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id) // find the camp by id passed in the parameters of the request   
    if (!campground){
        req.flash("error", "Cannot find this campground!");
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
};

module.exports.updateCampground = async(req,res) => {
    const { id } = req.params; // id is sent in the request parameters
    // req body holds contents of the form
    // use spread operator (...) to spread the campground object
    // into the db model object
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }) // three dots will returns a list of campground fields
    const imgs = req.files.map(f =>({ url: f.path, filename:f.filename })); // implicit return
    campground.images.push(...imgs); // spread the array of new images to be pushed to the existing array
    await campground.save();
    // check if there are images to delete
    if (req.body.deleteImages){
        // remove from cloudinary
        for(let filename of req.body.deleteImages){
            cloudinary.uploader.destroy(filename);
        }
        // remove from images array of the campground
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
        console.log(campground)
    }
        req.flash("success", "Successfully updated campground!")
    // redirect to the just edited object
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.destroyCampground = async(req, res) =>{
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Campground deleted")
    res.redirect('/campgrounds');
};