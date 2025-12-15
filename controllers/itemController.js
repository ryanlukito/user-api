const Item = require('../models/Item');

exports.createItem = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const {name, description} = req.body;

        const item = await Item.create({
            name,
            description,
            owner: userId
        });

        res.status(201).json({
            message: 'Item created',
            data: item
        });
    } catch(error) {
        next(error);
    }
}

exports.getMyItems = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const items = await Item.find({
            owner: userId,
            deletedAt: null
        }).sort({createdAt: -1});

        res.json({
            count: items.length,
            data: items
        });
    } catch(error) {
        next(error);
    }
}

exports.getAllItems = async (req, res, next) => {
    try {
        const items = await Item.find({deletedAt: null}).populate('owner', 'name email role');

        res.json({data: items});
    } catch(error) {
        next(error);
    }
}

exports.updateItem = async (req, res, next) => {
    try {
        const {id} = req.params;
        const userId = req.user.id;

        const item = await Item.findOne({
            _id: id,
            owner: userId,
            deletedAt: null
        });

        if (!item) {
            return res.status(404).json({
                message: 'Item not found or not yours'
            })
        }

        item.name = req.body.name ?? item.name;
        item.description = req.body.description ?? item.description;

        await item.save();

        res.json({
            message: 'Item updated',
            data: item
        })
    } catch(error) {
        next(error);
    }
}