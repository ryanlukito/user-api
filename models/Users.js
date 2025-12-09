const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: false
    },
    refreshToken: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    profilePicture: {
        type: String,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    }

}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);