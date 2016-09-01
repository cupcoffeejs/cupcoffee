var paths = require('../configs/paths'),
    config = require('../configs/config')

module.exports = () => {

    var model;

    if (config.database) {
        /**
         * Mongoosejs
         * */
        if (config.database.type && config.database.type == "mongodb") {
            model = new(require('./mongoose.js'))();
        }
        /**
         * Sequelizejs
         * */
        else {
            model = new(require('./sequelize.js'))();
        }
    }

    return model;
}