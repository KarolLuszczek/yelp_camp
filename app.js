const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const mongoSanitize = require('express-mongo-sanitize');
const flash = require('connect-flash');
const helmet = require('helmet');

const MongoStore = require("connect-mongo"); // for storing session data on mongo

if(process.env.NODE_ENV !== "prodcution") {
    // look for key, value paris in the .env file
    require('dotenv').config(); // if not in production add contents of .env to process.env
};

const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const dbUrl = process.env.ATLAS_URL || 'mongodb://localhost:27017/yelp-camp';
//const dbUrl = process.env.ATLAS_URL;
mongoose.connect(dbUrl, {
//mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
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

// Tell express to serve public directory
app.use(express.static(path.join(__dirname, 'public')));

// Use mongo sanitize to prevent mongo injections
app.use(mongoSanitize());
// enable helmet middleware
app.use(helmet());
// conetnet policy for helmet
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://cdn.jsdelivr.net",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dmcsvx9ib/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// setyp mongo store with lazy updates
// make changes in db after touchAfter seconds
const secret = process.env.SECRET || 'thisshouldbeanenvvariable'

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: secret,
    touchAfter: 24*60*60
});

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e)
});

// Configure session
const sessionConfig = {
    store,
    name: 'notdefualtname',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // will not reveal cookie in case of cross-site script attack
        //secure: true, cookies only over HTTPS (for deployment)
        expires: Date.now() + 1000*60*60*24*7, // expires in a week (in milliseconds)
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()) // to enable persisiten logging sessions, session must be used before this
passport.use(new LocalStrategy(User.authenticate())) // autenticate() function form the passport-local-mongoose plugin
passport.serializeUser(User.serializeUser()) // defines how the user is stored in the session. Also comes from the plugin into the model.
passport.deserializeUser(User.deserializeUser()) // defines how the user is deseiralized from the session Also comes from the plugin into the model.


// middleware to run before any route
app.use((req, res, next) => {
    res.locals.currentUser = req.user; // add current user (via passport) to locals (for showing navbar elements)
    res.locals.success = req.flash('success'); // locals is available in all the templates
    res.locals.error = req.flash('error');
    next();
})


// Specify routers
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes); // first arugment defines the prefix for all routes in campgrounds router
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home') // with relative path it goes to views/home.ejs
});

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

const port = process.env.PORT || 3000; // 80 will be avaialble by defualy on heroku

app.listen(port, ()=> {
    console.log(`serving on port ${port}`)
});
