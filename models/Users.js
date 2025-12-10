const mongoose = require('mongoose');
const softDeletePlugin = require('./plugins/softDeletePlugin');

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
    },
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null,
    },
    deletedAt: {
        type: Date,
        default: null,
    }

}, {timestamps: true});

userSchema.plugin(softDeletePlugin);

module.exports = mongoose.model('User', userSchema);