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
            var dbconfig = config('database_config') ? JSON.parse(config('database_config')) : null;

            if (config('database_connect')) {
                mongoose.connect(JSON.parse(config('database_connect')), dbconfig);
            } else {
                var host = config('database_host') || config('database_hostname'),
                    name = config('database_name')

                mongoose.connect(`mongodb://${host}/${name}`, dbconfig);
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
                            models[model.name] = mongoose.model(model.name, this.middleware.exists("mongoose") ? this.middleware.emit("mongoose", model) : model);
                        }
                    }
                });

            return models;
        }
        return null;
    }

}
