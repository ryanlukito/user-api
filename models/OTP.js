const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    purpose: {
        type: String,
        enum: ['VERIFY_EMAIL', 'RESET_PASSWORD'],
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model("OTP", OTPSchema);