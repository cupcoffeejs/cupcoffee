/**
 * routes/index.js
 * */

"use strict";

var express = require('express'),
    router = express.Router(),
    fs = require('fs'),
    path = require('path');

module.exports = class {

    constructor(config, paths) {
        this.config = config;
        this.paths = paths;
        this.files = [];
        this.controller = new (require('../controllers'))(config, paths);
    }

    loadFiles() {
        var files = [];

        fs.readdirSync(paths.app.routes)
            .filter(function (file) {
                return (file.indexOf(".") !== 0);
            })
            .forEach(function (file) {
                files.push(path.join(paths.app.routes, file));
            });

        return files;
    }

    auto() {
        var files = this.loadFiles();

        for (var key in files) {
            var appRouter = require(files[key]);

            if (typeof appRouter === 'function') {
                router.use('/', appRouter);
            }
        }

        this.controller.load();

        router.all('*', (request, response) => {
            this.controller.http(request, response).find()
        });

        return router;
    }

}