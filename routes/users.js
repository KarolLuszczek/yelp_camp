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
const users = require('../controllers/users')

router.route('/register')
    .get(users.renderRegisterForm)
    .post(catchAsync(users.registerUser));

router.route('/login')
    .get(users.renderLogin)
    // Uses passport.authenticate middlewate with local strategy
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect:'/login'}), users.Login);

router.get('/logout', users.Logout);

module.exports = router;
