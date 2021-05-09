const User = require('../models/user');

module.exports.renderRegisterForm = (req, res)=>{
    res.render('users/register')
};

module.exports.registerUser = async(req, res, next) => {
    try {
    const {email, username, password} = req.body;
    const user = new User({email, username});
    console.log("Registering user ..")
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
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
};

module.exports.Login = (req, res)=> {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds' // if the user was redirected to login when aceessing some URL, they will be redirected back there after logging in
    delete req.session.returnTo; // remove the originalURL from session
    res.redirect(redirectUrl);
};

module.exports.Logout = (req, res)=>{
    req.logout();
    req.flash('success', "Goodbye!")
    res.redirect('/campgrounds');
};