var Campground = require("../models/campground");
var Comment = require("../models/comment");
var User = require("../models/user");

//middleware goes here
var middlewareObj = {};

//Campground Middleware
middlewareObj.checkCampgroundOwnership = function(req, res, next){
    //check if user is logged in
    if(req.isAuthenticated()){
        //check Campgrounds
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err || !foundCampground){
                req.flash("error", "Campground Not Found")
                return res.redirect("back");
            }else{
                 //does user own's the campground
                if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                    //if yes allow to edit
                    next();
                }else{
                    //else you are not allowed to do so
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    }else{
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

//Comment Middleware
middlewareObj.checkCommentOwnership = function(req, res, next){
    //check if user is logged in
    if(req.isAuthenticated()){
        //check Comments
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
                console.log(err);
                req.flash("error", "Comment not found");
                return res.redirect("back");
            }else{
                //does user own's the comment
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                    //if yes allow to edit
                    next();
                }else{
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    }else{
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}


//Login Middleware
middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

//User Middleware
middlewareObj.checkUserOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        User.findById(req.params.id, function(err, foundUser){
            if(err || !foundUser){
                console.log(err);
                req.flash("error", "Something went wrong");
                res.redirect("back");
            }else{
                next();
            }
        });
    }else{
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

module.exports = middlewareObj;