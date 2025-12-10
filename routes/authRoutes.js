const express = require('express');
const rateLimit = require('express-rate-limit');

const {
    register, 
    login, 
    refresh, 
    logout, 
    forgotPassword,
    verifyOTP,
    resetPassword,
    verifyEmail,} = require('../controllers/authController');
const router = express.Router();

const otpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: 'Too many OTP requests'
});

const loginLimiter = rateLimie({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many login attempts'
})

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/verify-otp', otpLimiter, verifyOTP);
router.post('/reset-password', resetPassword);
router.post('/verify-email', otpLimiter, verifyEmail);

module.exports = router;