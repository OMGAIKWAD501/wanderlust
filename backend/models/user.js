const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    avatar: {
        url: String,
        filename: String,
    },
    bio: {
        type: String,
        default: "",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// This plugin adds username, password, salt and hash fields, and provides methods
userSchema.plugin(passportLocalMongoose.default || passportLocalMongoose);

const User = mongoose.model("User", userSchema);
module.exports = User;
