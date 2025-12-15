const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {timestamps: true});

module.exports = mongoose.model('Item', itemSchema);