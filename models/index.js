/**
 * models/index.js
 * */

"use strict";

var fs = require("fs"),
    path = require("path"),
    Sequelize = require("sequelize"),
    exists = require('fs-exists-sync');

module.exports = class {

    constructor(config) {
        if (!config) {
            return null;
        }

        return this.connect(config);
    }

    connect(config) {
        if (exists(paths.app.models)) {
            var sequelize = new Sequelize(config.schema, config.username, config.password, config.config),
                db = {};


            fs.readdirSync(paths.app.models)
                .filter((file) => {
                    return (file.indexOf(".") !== 0) && (file !== "index.js");
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