"use strict"

module.exports = (config) => {

    var model;

    if (config.database) {
        /**
         * Mongoosejs
         * */
        if (config.database.type && config.database.type == "mongodb") {
            model = new (require('./mongoose.js'))(config.database);
        }
        /**
         * Sequelizejs
         * */
        else {
            if (config.database.options) {
                config.database.config = config.database.options;
            }

            if (!config.database.config) {
                config.database.config = {};
                config.database.config.dialect = config.database.type;
                config.database.config.host = config.database.host || 'localhost';
            }
            else {
                if (config.database.config.dialect) {
                    config.database.type = config.database.config.dialect;
                }

                if (config.database.config.host) {
                    config.database.host = config.database.config.host;
                }
            }

            model = new (require('./sequelize.js'))(config.database);
        }
    }

    return model;
}