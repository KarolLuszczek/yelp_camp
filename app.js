const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'ejs'); // Using ejs templates
app.set('views', path.join(__dirname, 'views')) // set a relative path to /views

app.listen(3000, ()=> {
    console.log('serving on port 3000')
})

app.get('/', (req, res) => {
    res.render('home') // with relative path it goes to views/home.ejs
})
