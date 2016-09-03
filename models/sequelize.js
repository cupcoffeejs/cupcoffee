/**
 * models/index.js
 * */

"use strict";

var fs = require("fs"),
    path = require("path"),
    exists = require('fs-exists-sync'),
    Sequelize = require("sequelize"),
    middleware = require('./middleware/index.js'),
    paths = require('../configs/paths'),
    config = require('../configs/config')

module.exports = class {

    constructor() {
        this.middleware = new middleware();

        return this.connect();
    }

    connect() {
        if (exists(paths.app.models)) {
            var sequelize = new Sequelize(config('database_name'), ('database_username') || ('database_user'), ('database_password'), ('database_config')),
                db = {};

            fs.readdirSync(paths.app.models)
                .filter((file) => {
                    return (file.indexOf(".") !== 0 && file.indexOf(".mongoose.js") == -1);
                })
                .forEach((file) => {
                    var model = sequelize.import(path.join(paths.app.models, file));
                    db[model.name] = model;
                });

            Object.keys(db).forEach((modelName) => {
                if ("associate" in db[modelName]) {
                    db[modelName].associate(db);
                }
            });

            db.sequelize = sequelize;

            return db;
        }
        return null;
    }

}
