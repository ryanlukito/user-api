const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        status: 'Error',
        message: err.message || 'Interval Server Error',
    });
};

module.exports = errorHandler;