var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var middleware = require('../middleware');
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
//var Googleuser = require('../models/googleuser');
//var passportSetup = require('../config/passport-setup');
var multer = require('multer');

var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter })

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'dnivhhamp',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//root route
router.get("/", function(req, res){
    res.render("landing");
})

//show register form
router.get("/register", function(req, res){
    res.render("register", {page: 'register'});
});

//handle register logic
router.post("/register", upload.single('image'), function(req, res){
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        mobile: req.body.mobile,
        email: req.body.email
    });

    if(req.body.adminCode === "superuser123"){
        newUser.isAdmin = true;
    }

    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
        if(err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }

        req.body.image = result.secure_url;
        req.body.imageId = result.public_id;
        newUser.image =  req.body.image
        newUser.imageId = req.body.imageId
        //console.log(newUser)

    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Successfully Signed Up! Nice to meet you " + user.username)
            res.redirect("/campgrounds");
        });
    });
});
});

//show login form
router.get("/login", function(req, res){
    res.render("login", {page: 'login'});
});

//handle login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res){
});

//logout route
router.get("/logout", function(req, res){
    req.logOut();
    req.flash("success", "Logged you out!");
    res.redirect("/campgrounds");
});

//forgot password
router.get("/forgot", function(req, res){
    res.render("forgot");
});
  

router.post("/forgot", function(req, res, next){
    async.waterfall([
        function(done){
            crypto.randomBytes(20, function(err, buf){
                if(err){
                    console.log(err);
                }else{
                    var token = buf.toString("hex");
                    done(err, token);
                }
            });
        },
        function(token, done){
            User.findOne({email: req.body.email}, function(err, user){
                if(err){
                    console.log(err);
                }else{
                    if(!user){
                        req.flash("error", "No account with that email address exists.");
                        return res.redirect("/forgot");
                    }else{
                        user.resetPasswordToken = token;
                        user.resetPasswordExpires = Date.now() + 3600000; //1 hour

                        user.save(function(err){
                            done(err, token, user);
                        });
                    }
                }
            });
        },
        function(token, user, done){
            var smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "procamp72@gmail.com", //create an email for project
                    pass: process.env.GMAILPW   // use for safe side: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: "procamp72@gmail.com",
                subject: "ProCamping Password Reset",
                text: "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
                "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
                "http://" + req.headers.host + "/reset/" + token + "\n\n" +
                "If you did not request this, please ignore this email and your password will remain unchanged.\n"
            };
            smtpTransport.sendMail(mailOptions, function(err){
                console.log("mail sent");
                req.flash("success", "An email has been sent to " + user.email + " with further instructions.");
                done(err, "done");
            });
        }
    ], function(err){
        if(err) return next(err);
        res.redirect("/forgot");
    });
});

router.get("/reset/:token", function(req, res){
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }}, function(err, user){
        if(err){
            console.log(err);
        }else{
            if(!user){
                req.flash("error", "Password reset token is invalid or has expired.");
                return res.redirect("/forgot");
            }else{
                res.render("reset", {token: req.params.token});
            }
        }
    });
});

router.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            if(err){
                console.log(err);
            }else{
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                  }
                  if(req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function(err) {
                      user.resetPasswordToken = undefined;
                      user.resetPasswordExpires = undefined;
          
                      user.save(function(err) {
                        req.logIn(user, function(err) {
                          done(err, user);
                        });
                      });
                    })
                  } else {
                      req.flash("error", "Passwords do not match.");
                      return res.redirect('back');
                  }
            }
        });
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'procamp72@gmail.com',
            pass: process.env.GMAILPW
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'procamp72@gmail.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], function(err) {
      res.redirect('/campgrounds');
    });
  });



//users profile
router.get("/user/:id", middleware.checkUserOwnership, function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            console.log(err);
            req.flash("error", "Something went wrong");
            return res.redirect("/");
        }else{
            Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds){
                if(err){
                    console.log(err);
                    req.flash("error", "Something went wrong");
                    return res.redirect("/");
            }else{
                res.render("users/show", {user: foundUser, campgrounds: campgrounds}); 
                console.log(campgrounds);
            }
            });
        }
    });
});


// USER PROFILE
router.get("/users/:id", function(req, res) {
    User.findById(req.params.id, function(err, foundUser) {
      if(err) {
        req.flash("error", "Something went wrong.");
        return res.redirect("/");
      }
      Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds) {
        if(err) {
          req.flash("error", "Something went wrong.");
          return res.redirect("/");
        }
        res.render("users/show", {user: foundUser, campgrounds: campgrounds});
      })
    });
  });

// //auth with google
// router.get('/auth/google', passport.authenticate('google',{
//     scope:['profile']
// }));

// //callback route for google to redirect to
// router.get('/auth/google/redirect', passport.authenticate('google'),(req, res) => {
//     //res.send(req.user);
//     res.redirect('/campgrounds');
// });


module.exports = router;
