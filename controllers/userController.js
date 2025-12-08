const User = require('../models/Users');
const {validationResult} = require('express-validator');
const bcrypt = require('bcrypt');

exports.createUser = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({errors: error.array()});
        }

        const user = await User.create(req.body);
        res.status(201).json({message: 'User created', data: user});
    } catch (error) {
        next(error);
    }
};

exports.getUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const sort = req.query.sort || 'createdAt';
        const order = req.query.order === 'desc' ? -1 : 1;
        
        const filter = {
            name: {$regex: search, $options: 'i'}
        };

        const totalData = await User.countDocuments(filter);

        const users = await User.find(filter)
            .select('-password -refreshToken')
            .sort({[sort]: order})
            .skip((page-1) * limit)
            .limit(limit);

        res.json({
            page,
            limit,
            totalData,
            totalPages: Math.ceil(totalData/limit),
            users
        });
    } catch (error) {
        next(error);
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if(!error.isEmpty()) {
            return res.status(400).json({errors: error.array()})
        }
        const update = await User.findByIdAndUpdate(req.params.id, req.body, {new: true});
        res.json({message: 'User updated', data: update});
    } catch (error) {
        next(error);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({message: 'User deleted'});
    } catch (error) {
        next(error);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id

        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user) return res.status(404).json({message: "User not found"});

        res.json({
            message: "Profile fetched successfully",
            user
        });

    } catch (error) {
        next(error);
    }
}

exports.updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const {name, email} = req.body;

        if (!name && !email) return res.status(400).json({message: "No data provided to update"});

        const updatedData = {};
        if (name) updatedData.name = name;
        if (email) updatedData.email = email;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updatedData,
            {new: true, select: "-password -refreshToken"}
        );

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        })
    } catch (error) {
        next(error);
    }
}

exports.updatePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const {oldPassword, newPassword} = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({message: "oldPassword & newPassword required"});
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({message: "User not found"});

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({message: "Old password incorrect"});

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;

        user.refreshToken = null;
        await user.save();

        res.status(200).json({message: "Password updated successfully. Please login again"});
    } catch (error) {
        next(error);
    }
}

exports.updateProfilePicture = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({message: "Picture is required!"});

        }

        const userId = req.user.id;
        const imageName = req.file.filename;

        const user = await User.findByIdAndUpdate(
            userId,
            {profilePicture: imageName},
            {new: true}
        ).select('-password -refreshToken');

        user.profilePicture = req.file.filename;
        await user.save();

        res.status(200).json({
            message: 'Profile picture updated',
            pictureUrl: `${req.protocol}://${req.get('host')}/uploads/${imageName}`,
            user
        });
    } catch (error) {
        next(error);
    }
};