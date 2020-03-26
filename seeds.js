// var mongoose = require('mongoose'),
//     Campground = require('./models/campground');

// var Comment = require('./models/comment');
// var data = [
//     {
//         title: "Cloud's Rest",
//         image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=700&q=60",
//         description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
//     },
//     {
//         title: "Sunny Campers",
//         image: "https://images.unsplash.com/photo-1492836270875-f998d2806e14?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=700&q=60",
//         description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
//     },
//     {
//         title: "Wassup Campers",
//         image: "https://images.unsplash.com/photo-1558732599-c17e5a5900ae?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=700&q=60",
//         description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
//     }
// ]
// //remove campgrounds on start of app
// function seeds() {
//     Campground.remove({}, function (err, removedCampground) {
//         // if (err) {
//         //     console.log(err);
//         // } else {
//         //     console.log("Campgrounds has been removed");
//         //     //add campgrounds
//         //     data.forEach(function (campground) {
//         //         Campground.create(campground, function (err, createCampground) {
//         //             if (err) {
//         //                 console.log(err);
//         //             } else {                    
//         //                 console.log("Campgrounds created");
//         //                 //add comments
//         //                 Comment.create(
//         //                     {
//         //                         text: "This place is awesome but no internet",
//         //                         author: "Homer"
//         //                     }, function(err, comment){
//         //                         if(err){
//         //                             console.log(err);
//         //                         }else{                            
//         //                             createCampground.comments.push(comment);
//         //                             createCampground.save();
//         //                             console.log("Created new Comment");
//         //                         }
//         //                     });
//         //             }
//         //         });
//         //     });
//         // }
//     });
// }

// module.exports = seeds;



