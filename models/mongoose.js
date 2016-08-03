"use strict";

var fs = require("fs"),
    path = require("path"),
    exists = require('fs-exists-sync'),
    mongoose = require('mongoose'),
    events = require('../events/index.js'),
    middleware = require('../middleware/index.js');

module.exports = class {

    constructor(config, paths) {
        if (!config) {
            return null;
        }

        this.middleware = new middleware(paths);
        this.events = new events(paths);

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

            mongoose.events = this.events;
            mongoose.logger = require('../logs')(config, paths);

            var models = [];

            fs.readdirSync(paths.app.models)
                .filter((file) => {
                    return (file.indexOf(".") !== 0 && file.indexOf(".sequelize.js") == -1);
                })
                .forEach((file) => {
                    var model = require(path.join(paths.app.models, file))(mongoose);
                    if (typeof model == "object") {
                        var schema = (model.schema) ? model.schema : model;

                        if (model.name) {
                            models[model.name] = mongoose.model(model.name, this.middleware.emit("mongoose", model));
                        }
                    }
                });

            return models;
        }
        return null;
    }

}
