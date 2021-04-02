const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const Campground = require('./models/campground');

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

app.set('view engine', 'ejs'); // Using ejs templates
app.set('views', path.join(__dirname, 'views')); // set a relative path to /views

// tell express to prase requests body
app.use(express.urlencoded({ extended: true }));

app.listen(3000, ()=> {
    console.log('serving on port 3000')
});

app.get('/', (req, res) => {
    res.render('home') // with relative path it goes to views/home.ejs
});

// Basic routes for the app
// campground/index
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({}) // find all camps in the db
    res.render('campgrounds/index', { campgrounds })
});
// campground CREATE route\
// this route must be declared before /campgroudns/:id
// otherwise new will be treated as :id 
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
});
// post route to save a new campground
app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground); // create a new db entry from the form post request
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
});
// campground SHOW route
app.get('/campgrounds/:id', async(req, res) => {
    const campground = await Campground.findById(req.params.id) // find the camp by id passed in the parameters of the request
    res.render('campgrounds/show', { campground });
});