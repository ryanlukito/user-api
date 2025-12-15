const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');
const {
    createItem,
    getMyItems,
    getAllItems,
    updateItem
} = require('../controllers/itemController');

router.post('/', auth, createItem);
router.get('/myItem', auth, getMyItems);
router.get('/', auth, authorizeRole('admin'), getAllItems);
router.put('/:id', auth, updateItem);

module.exports = router;