const User = require('../models/Users');
const OTP = require('../models/OTP');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

exports.register = async (req, res, next) => {
    try {
        const {name, email, password, age, role} = req.body;

        const exist = await User.findOne({email});
        if (exist) return res.status(400).json({message: 'Email already registered'});

        const hashedPass = await bcrypt.hash(password, 10);
        const user = await User.create({
            name, 
            email, 
            password: hashedPass, 
            age, 
            role: role || "user",
            isVerified: false,
        });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await OTP.create({
            email,
            otp,
            expiresAt,
            purpose: "VERIFY_EMAIL"
        });

        await sendEmail('ryankrishandilukito@mail.ugm.ac.id', 'Verify Your Account', `Your OTP is ${otp}`);

        res.status(201).json({message: "Register success. Please verify your email through OTP code", data: user});
    } catch (error) {
        next(error);
    }
}

exports.login = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if (!user) return res.status(400).json({message: "User not found"})

        if (!user.isVerified) {
            return res.status(403).json({message: "Please verify your email first."})
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({message: "Wrong Password"})

        const accessToken = jwt.sign(
            {id: user._id, email: user.email, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: "15m"}
        );

        const refreshToken = jwt.sign(
            {id: user._id, email: user.email, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: "7d"}
        );

        user.refreshToken = refreshToken;
        await user.save();

        res.json({message: 'Login Success', accessToken, refreshToken})
    } catch (error) {
        next(error);
    }
}

exports.refresh = async(req, res, next) => {
    try {
        const {refreshToken} = req.body;
        if (!refreshToken) return res.status(401).json({message: 'No refresh token'});

        const user = await User.findOne({refreshToken});
        if (!user) return res.status(403).json({message: 'Invalid refresh token'});

        jwt.verify(refreshToken, process.env.JWT_SECRET);

        const newAccessToken = jwt.sign(
            {id: user._id, email: user.email},
            process.env.JWT_SECRET,
            {expiresIn: '15m'}
        )

        res.json({accessToken: newAccessToken})
    } catch (error) {
        next(error);
    }
}

exports.logout = async(req, res) => {
    try {
        const {refreshToken} = req.body;
        if (!refreshToken) return res.status(400).json({message: "Refresh token required"});

        await User.findOneAndUpdate({refreshToken}, {refreshToken: null});

        res.json({message: "Logout success"});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

exports.forgotPassword = async(req, res, next) => {
    try {
        const {email} = req.body;
        const user = await User.findOne({email});
        if (!user) return res.status(400).json({message: 'Email not found'})

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000;

        await OTP.create({email, otp, expiresAt, purpose: 'RESET_PASSWORD'});

        await sendEmail('ryankrishandilukito@mail.ugm.ac.id', 'Your OTP Code', `Your OTP is ${otp}`)

        res.status(200).json({message: 'OTP sent to email'})
    } catch (error) {
        next(error);
    }
}

exports.verifyOTP = async(req, res, next) => {
    try {
        const {email, otp} = req.body;

        const record = await OTP.findOne({email, otp, purpose:'RESET_PASSWORD'});
        if (!record) return res.status(400).json({message: "Invalid OTP"});

        if (Date.now() > record.expiresAt) {
            return res.status(400).json({message: 'OTP has expired'});
        }

        record.verified = true;
        await record.save();

        res.json({message: 'OTP verified successfully'});
    } catch (error) {
        next(error);
    }
}

exports.resetPassword = async(req, res, next) => {
    try {
        const {email, newPassword} = req.body;

        const record = await OTP.findOne({email, verified: true});
        if (!record) return res.status(400).json({message: 'OTP not verified'});

        const hashed = await bcrypt.hash(newPassword, 10);
        await User.findOneAndUpdate({email}, {password: hashed});

        await OTP.deleteMany({email})
    } catch (error) {
        next(error);
    }
}

exports.verifyEmail = async(req, res, next) => {
    try {
        const {email, otp} = req.body;

        const otpDoc = await OTP.findOne({
            email,
            otp,
            purpose: 'VERIFY_EMAIL'
        });

        if (!otpDoc) return res.status(400).json({message: 'Invalid OTP'});
        if (otpDoc.expiresAt < new Date()) return res.status(400).json({message: 'OTP expired'});

        await User.findOneAndUpdate({email}, {isVerified: true});
        await OTP.deleteMany({email, purpose: 'VERIFY_EMAIL'});

        res.status(200).json({message: "Email verified successfully, you can now login."});
    } catch (error) {
        next(error);
    }
}

