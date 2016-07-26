"use strict";

var fs = require("fs"),
    path = require("path"),
    exists = require('fs-exists-sync'),
    mongoose = require('mongoose');

module.exports = class {

    constructor(config) {
        if (!config) {
            return null;
        }

        return this.connect(config);
    }

    connect(config) {
        if (exists(paths.app.models)) {

            if (config.connect) {
                mongoose.connect(config.connect, config.config);
            }
            else {
                mongoose.connect(`mongodb://${config.host}/${config.name}`, config.config);
            }

            var models = [];

            fs.readdirSync(paths.app.models)
                .filter((file) => {
                    return (file.indexOf(".") !== 0 && file.indexOf(".sequelize.js") == -1);
                })
                .forEach((file) => {
                    var model = require(path.join(paths.app.models, file))(mongoose);
                    if (typeof model == "object") {
                        if (model.name && model.schema) {
                            models[model.name] = mongoose.model(model.name, model.schema);
                        }
                        else if (model.name) {
                            models[model.name] = mongoose.model(model.name, model);
                        }
                    }
                });

            return models;
        }
        return null;
    }

}