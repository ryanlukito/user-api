module.exports = function softDeletePlugin(schema) {
    schema.pre(/^find/, function(next) {
        this.where({deletedAt: null});
        next();
    })
}