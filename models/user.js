var mongoose = require('mongoose');
var passportLocalStrategy = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true
    },
    password: String,
    image: String,
    imageId: String,
    firstName: String,
    lastName: String,
    mobile: String,
    email: {
        type: String,
        unique: true,
        required: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: {
        type: Boolean,
        default: false
    },
});

userSchema.plugin(passportLocalStrategy);

module.exports = mongoose.model("User", userSchema);