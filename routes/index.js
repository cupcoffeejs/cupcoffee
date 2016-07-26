/**
 * routes/index.js
 * */

"use strict";

var fs = require('fs'),
    path = require('path'),
    exists = require('fs-exists-sync'),
    models = require('../models');

module.exports = class {

    constructor(config, paths) {
        this.config = config;
        this.paths = paths;
        this.model = models(config, paths)
        this.view = new (require('../views'))({config, paths});
        this.controller = new (require('../controllers'))(config, paths);

        this.controller.view = this.view;
        this.controller.model = this.model;
    }

    loadFiles() {
        var files = [];

        if (exists(paths.app.routes)) {
            fs.readdirSync(paths.app.routes)
                .filter(function (file) {
                    return (file.indexOf(".") !== 0);
                })
                .forEach(function (file) {
                    files.push(path.join(paths.app.routes, file));
                });
        }

        return files;
    }

    auto(express) {
        var express = require('express'),
            router = express.Router();

        var files = this.loadFiles();

        this.controller.load();

        for (var key in files) {
            var appRouter = require(files[key])({
                'router': express.Router(),
                'controller': this.controller,
                'model': this.model,
                'view': this.view,
                'paths': this.paths,
                'config': this.config
            });

            if (typeof appRouter === 'function') {
                router.use('/', appRouter);
            }
        }

        router.all('*', (request, response) => {
            this.controller.http(request, response).find()
        });

        return router;
    }
}