"use strict";

var fs = require("fs"),
    path = require("path"),
    exists = require('fs-exists-sync'),
    mongoose = require('mongoose'),
    events = require('../events/index.js'),
    middleware = require('../middleware/index.js'),
    paths = require('../configs/paths'),
    config = require('../configs/config');

module.exports = class {

    constructor() {
        this.middleware = new middleware();
        this.events = new events();

        return this.connect();
    }

    connect() {
        if (exists(paths.app.models)) {

            if (config('database_connect')) {
                mongoose.connect(JSON.parse(config('database_connect')), JSON.parse(config('database_config')) || null);
            }
            else {
                var host = config('database_host') || config('database_hostname')
                var name = config('database_name')
                mongoose.connect(`mongodb://${host}/${name}`, JSON.parse(config('database_config')) || null);
            }

            mongoose.events = this.events;
            mongoose.logger = require('../logs')();

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