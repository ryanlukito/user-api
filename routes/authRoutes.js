const express = require('express');
const {
    register, 
    login, 
    refresh, 
    logout, 
    forgotPassword,
    verifyOTP,
    resetPassword} = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP)
router.post('/reset-password', resetPassword)

module.exports = router;