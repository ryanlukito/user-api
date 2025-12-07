const express = require('express');

const {
    getUsers, 
    createUser, 
    updateUser, 
    deleteUser, 
    getProfile, 
    updateProfile,
    updatePassword,
    updateProfilePicture} = require('../controllers/userController');

const auth = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();
const {body} = require('express-validator');

const userValidation = [
    body('name').notEmpty().withMessage('Name wajib diisi'),
    body('email').isEmail().withMessage('Email tidak valid'),
    body('age').optional().isInt().withMessage('Age harus angka')
]

router.get('/', auth, authorizeRole("admin"), getUsers);
router.post('/', auth, authorizeRole("admin"), userValidation, createUser);

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/profile/password', auth, updatePassword);
router.put('/profile/picture', auth, upload.single('picture'), updateProfilePicture);

router.put('/:id', auth, authorizeRole("admin"), userValidation, updateUser);
router.delete('/:id', auth, authorizeRole("admin"), deleteUser)

module.exports = router;