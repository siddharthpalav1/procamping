var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require('../middleware');
var NodeGeocoder = require('node-geocoder');
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

var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

var geocoder = NodeGeocoder(options);

//INDEX - show all campgrounds
router.get("/", function (req, res) {
    //Get all campgrounds from DB
    var noMatch = null;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), "gi");
        Campground.find({ title: regex }, function (err, allCampgrounds) {
            if (err) {
                console.log(err);
            } else {
                if (allCampgrounds.length < 1) {
                    noMatch = "No campgrounds match that query, please try again.";
                }
                res.render("campgrounds/index", { campgrounds: allCampgrounds, page: 'campgrounds', noMatch: noMatch });
            }
        });
    } else {
        Campground.find({}, function (err, allCampgrounds) {
            if (err) {
                console.log("error for campground displayed");
                console.log(err);
            } else {
                // console.log("Campground displayed");
                // console.log(allCampgrounds);
                res.render("campgrounds/index", { campgrounds: allCampgrounds, page: 'campgrounds', noMatch: noMatch });
            }
        });
    }
});


//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function (req, res) {
    // get data from form and add to campgrounds array
    var title = req.body.title;
    // var imageurl = req.body.imageurl;
    var price = req.body.price;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;

        //include when you understood
        cloudinary.v2.uploader.upload(req.file.path, function (err, result) {
            if (err) {
                req.flash('err', err.message);
                return res.redirect('back');
            }
            // add cloudinary url for the image to the campground object under image property
            req.body.image = result.secure_url;
            // add image's public_id to campground object
            req.body.imageId = result.public_id;

            var newCampground = { title: title, image: req.body.image, imageId: req.body.imageId, price: price, description: description, author: author, location: location, lat: lat, lng: lng };

            // Create a new campground and save to DB
            Campground.create(newCampground, function (err, newlyCreated) {
                if (err) {
                    req.flash('error', err.message);
                    return res.redirect('back');
                } else {
                    //redirect back to campgrounds page
                    req.flash("success", "Campground added successfully")
                    //console.log(newlyCreated);
                    res.redirect("/campgrounds");
                }
            });
        });
    });
});

router.get("/new", middleware.isLoggedIn, function (req, res) {
    //res.send("New Camp addition route");
    //will render a new camp form
    res.render("campgrounds/new");
});


//Show Route
router.get("/:id", function (req, res) {
    var id = req.params.id;
    // console.log("Value of id is: " + id);
    Campground.findById(id).populate("comments").exec(function (err, foundCampground) {
        if (err || !foundCampground) {
            console.log(err);
            req.flash("error", "Campground not found");
            return res.redirect("/campgrounds");
        } else {
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });
});

//get edit form
router.get("/:id/edit", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/edit", { campground: foundCampground });
        }
    });
});


// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), function (req, res) {
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            console.log("This is from update camproute" + err);
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;

        var updateCampground = {
            price: req.body.campground.price,
            title: req.body.campground.title,
            description: req.body.campground.description,
            location: req.body.campground.location,
            lat: req.body.campground.lat,
            lng: req.body.campground.lng
        }

        Campground.findById(req.params.id, async function (err, campground) {
            if (err) {
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                if (req.file) {
                    try {
                        await cloudinary.v2.uploader.destroy(campground.imageId);
                        var result = await cloudinary.v2.uploader.upload(req.file.path);
                        campground.imageId = result.public_id;
                        campground.image = result.secure_url;
                    } catch (err) {
                        req.flash("error", err.message);
                        return res.redirect("back");
                    }
                }
                campground.price = updateCampground.price;
                campground.title = updateCampground.title;
                campground.description = updateCampground.description;
                campground.location = updateCampground.location;
                campground.lat = updateCampground.lat;
                campground.lng = updateCampground.lng;
                campground.save();
                req.flash("success", "Successfully Updated!");
                res.redirect("/campgrounds/" + campground._id);
            }
        });
    });
});



router.delete('/:id', middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, async function(err, campground) {
      if(err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      try {
          await cloudinary.v2.uploader.destroy(campground.imageId);
          campground.remove();
          req.flash('success', 'Campground deleted successfully!');
          res.redirect('/campgrounds');
      } catch(err) {
          if(err) {
            req.flash("error", err.message);
            return res.redirect("back");
          }
      }
    });
  });



function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;


