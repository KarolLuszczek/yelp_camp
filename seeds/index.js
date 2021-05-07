const mongoose = require('mongoose');
const Campground = require('../models/campground');

const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers') // {} Deconstructs two lists imported from the module
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

// a oneliner function to return a random entry in the array
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany({}); // Remove all camps from db
    // Seed the database with 50 random camps and locations
    for(let i=0; i<200; i++){
        const random1000 =Math.floor(Math.random() * 1000); // JS trick forr generating random ints
        const price = Math.floor(Math.random()* 30) + 10;
        // Create a new random campground
        const camp = new Campground({
                author: '60885ad52758a32f8ced05b8',
                location: `${cities[random1000].city}, ${cities[random1000].state}`, // Using `` invokes template literal that contain placeholders ${expression}
                title: `${sample(descriptors)} ${sample(places)}`,
                geometry: { type: 'Point', coordinates: [ cities[random1000].longitude, cities[random1000].latitude ] },
                images:[
                    {
                    url: 'https://res.cloudinary.com/dmcsvx9ib/image/upload/v1619885092/YelpCamp/lbeftssqjxwrb5uiraig.jpg',
                    filename: 'YelpCamp/lbeftssqjxwrb5uiraig'
                  },
                  {
                    url: 'https://res.cloudinary.com/dmcsvx9ib/image/upload/v1619885093/YelpCamp/qk7z7th8dhfzvyxa5pwf.jpg',
                    filename: 'YelpCamp/qk7z7th8dhfzvyxa5pwf'
                  },
                  {
                    url: 'https://res.cloudinary.com/dmcsvx9ib/image/upload/v1619885094/YelpCamp/sbjnca0rlhwcfogewqz8.jpg',
                    filename: 'YelpCamp/sbjnca0rlhwcfogewqz8'
                  }],
                price: price,
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vulputate lacinia mauris. Nullam a aliquam tortor.'
            })
        await camp.save()
    }
};

// call seedDB
// seedDB is an async fucntion so it returns a promise
// use .then to close the db connection
seedDB().then( () => {
    mongoose.connection.close()
});