// ROUTES
// /register - GET : shows a form
// /register - POST : registeres a new user
// /login - GET: shows a login form
// /login - POST: logs in a user
const express = require('express');
const router = express.Router();
const passport = require('passport')
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

router.get('/register', (req, res)=>{
    res.render('users/register')
});

router.post('/register', catchAsync(async(req, res, next) => {
    try {
    const {email, username, password} = req.body;
    const user = new User({email, username});
    const registeredUser = await User.register(user, password); //passport will take the password, hash it and store it with the salts 
    console.log(registeredUser);
    // login helper function is from passport and estalishes a logged in session
    // it requires a callback
    req.login(registeredUser, err =>{
        if(err) return next(err);
        req.flash('success', 'Welcome to Yelp Camp!');
        res.redirect('/campgrounds');  
    })
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login')
});

// Uses passport.authenticate middlewate with local strategy
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect:'/login'}), (req, res)=> {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds' // if the user was redirected to login when aceessing some URL, they will be redirected back there after logging in
    delete req.session.returnTo; // remove the originalURL from session
    res.redirect(redirectUrl);
});

router.get('/logout', (req, res)=>{
    req.logout();
    req.flash('success', "Goodbye!")
    res.redirect('/campgrounds');
});

module.exports = router;
