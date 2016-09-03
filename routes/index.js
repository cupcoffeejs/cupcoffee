/**
 * routes/index.js
 * */

"use strict";

var fs = require('fs'),
    path = require('path'),
    exists = require('fs-exists-sync'),
    paths = require('../configs/paths'),
    config = require('../configs/config');

module.exports = class {

    constructor() {
        this.model = require('../models')()
        this.logger = require('../logs')();
        this.view = new(require('../views'))();
        this.controller = new(require('../controllers'))()
    }

    loadFiles() {
        var files = [];

        if (exists(paths.app.routes)) {
            fs.readdirSync(paths.app.routes)
                .filter(function(file) {
                    return (file.indexOf(".") !== 0 && path.extname(file) == ".js");
                })
                .forEach(function(file) {
                    files.push(path.join(paths.app.routes, file));
                });
        }

        return files;
    }

    auto(express) {
        var express = require('express'),
            router = express.Router();

        var files = this.loadFiles();


        this.controller.load()

        for (var key in files) {
            var appRouter = require(files[key])({
                'router': express.Router(),
                'controller': this.controller.init(),
                'model': this.model,
                'view': this.view,
                'logger': this.logger
            });

            if (typeof appRouter === 'function') {
                router.use('/', appRouter);
            }
        }

        if (config('scaffold') !== false) {
            router.all('*', (req, res) => {
                this.controller.init(req, res).find();
            });
        }

        return router;
    }
}