require("dotenv").config();

var express = require('express'),
app = express(),
port = process.env.PORT || 3000,
bodyParser = require('body-parser'),
mongoose = require('mongoose'),
flash = require('connect-flash'),
passport = require('passport'),
LocalStrategy = require('passport-local'),
methodOverride = require('method-override'),
Campground = require('./models/campground'),
Comment = require('./models/comment'),
User = require('./models/user'),
campgroundRoutes = require('./routes/campgrounds'),
commentRoutes = require('./routes/comments'),
indexRoutes = require('./routes/index')
// seedDB = require('./seeds'),
//googleauth = require('./routes/googleauth')    //google signon
// passportSetup = require('./config/passport-setup');
// cookieSession = require('cookie-session');
// keys = require('./config/keys');

//mongo connection
mongoose.connect("mongodb://localhost:27017/pro_camp_v12_4",{ useNewUrlParser: true, useUnifiedTopology: true});
//seedDB();  //seed the database
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
console.log("This is the name of the directory " + __dirname);

app.use(flash());

//PASSPORT CONFIGURATION
app.use(require('express-session')({
    secret: "Blue mechanical switches are awesome",
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.moment = require("moment");
    next();
});

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use(indexRoutes);
//app.use(googleauth);                             //Google signon feature

app.listen(port, function(req, res){
    console.log("Procamp server started");
});