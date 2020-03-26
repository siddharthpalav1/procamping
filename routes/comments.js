var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require('../models/campground');
var Comment = require('../models/comment');
var middleware = require('../middleware');


// ===============
// Comment Routes
// ===============

//Show Comment Route
router.get("/new", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        console.log(req.params);
        if(err || !campground){
            console.log(err);
            req.flash("error", "Comment not found");
            return res.redirect("back");
        }else{
            res.render("comments/new", {campground: campground});
        }
    });
});

//posting a comment
router.post("/", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }else{
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "Something went wrong");
                    console.log(err);
                }else{
                    //console.log(comment);
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //console.log("The username is: " + req.user.username);
                    //save the comment
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    //console.log("Comment Details: " + comment);
                    req.flash("success", "Successfully added comment");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
    //find a campground
    //add a comment to the campground
    //display the comment to the campground
});

//edit route for comments
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    // console.log(req.params.id);
    // console.log(typeof(req.params.comment_id));
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err || !foundCampground){
            console.log(err);
            req.flash("error", "Campground not found");
            res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                console.log(err);
                res.redirect("back");
            }else{
                res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
            }
        });
    });
});

//update route for comments
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            console.log(err);
            res.redirect("back");
        }else{
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});


//COMMENT DESTROY ROUTE
router.delete('/:comment_id',middleware.checkCommentOwnership, function(req, res){
    //find by id and remove
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if(err){
            return res.redirect('back');
        }
        Campground.findByIdAndUpdate(req.params.id, {
            $pull: {comments:req.params.comment_id}
        }, function(err) {
            if(err) {
                return res.redirect('back');
            }
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.id);
        });
    });
});

module.exports = router;