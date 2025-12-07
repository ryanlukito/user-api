const User = require('../models/Users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
    try {
        const {name, email, password, age, role} = req.body;

        const hashedPass = await bcrypt.hash(password, 10);
        const user = await User.create({
            name, email, password: hashedPass, age, role: role || "user"
        });

        res.status(201).json({message: "Register success", data: user});
    } catch (error) {
        next(error);
    }
}

exports.login = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if (!user) return res.status(400).json({message: "User not found"})
        
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