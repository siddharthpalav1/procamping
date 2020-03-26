// var express = require("express");
// var router = express.Router();
// var passport = require("passport");
// // var User = require("../models/user");
// // var Campground = require("../models/campground");
// // var middleware = require('../middleware');
// var passportSetup = require('../config/passport-setup');
// var index = require('./index')


// //auth with google
// router.get('/auth/google', passport.authenticate('google',{
//     scope:['profile']
// }));

// //callback route for google to redirect to
// router.get('/auth/google/redirect', passport.authenticate('google'),(req, res) => {
//     //res.send(req.user);
//     res.redirect('/campgrounds');
// });

// module.exports = router;