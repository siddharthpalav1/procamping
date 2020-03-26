// var passport = require('passport');
// var GoogleStrategy = require('passport-google-oauth20');
// var keys = require('./keys');
// var Googleuser = require('../models/googleuser');


// passport.serializeUser((user, done) => {
//     done(null, user.id);
// })

// passport.deserializeUser((id, done) => {
//     Googleuser.findById(id).then((user) => {
//         done(null, user);
//     })
// })

// passport.use(
//     new GoogleStrategy({
//         //options for google strat
//         callbackURL: '/auth/google/redirect',
//         clientID:keys.google.clientID,
//         clientSecret:keys.google.clientSecret
//     }, (accessToken, refreshToken, profile, done) => {
//         //passport callback function
//         console.log('passport callback function fired');
//         console.log(profile);
//         //check if user already exist in DB
//         Googleuser.findOne({ googleId: profile.id }).then(( currentUser ) => {
//             if( currentUser ){
//                 //already have the user
//                 console.log('user is: ' + currentUser);
//                 done(null, currentUser);
//             }else{
//                 new Googleuser({
//                     username: profile.displayName,
//                     firstName: profile.name.givenName,
//                     lastName: profile.name.familyName,
//                     googleId: profile.id
//                 }).save().then((newUser) => {
//                     console.log('new User created: ' + newUser);
//                     done(null, newUser);
//                 })
//             }
//         })
//     })
// )