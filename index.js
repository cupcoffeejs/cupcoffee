"use strict";

var paths = require('./configs/paths'),
    path = require('path'),
    config = require(path.join(paths.root, 'cupcoffee.json')),
    bodyParser = require('body-parser'),
    fileUpload = require('express-fileupload'),
    express = require('express'),
    app = express();


var Routes = module.exports.routes = new (require('./routes'))(config.app[config.app.env], paths);

module.exports.config = config;

module.exports.paths = paths;

module.exports.controller = Routes.controller;

module.exports.view = Routes.controller.view;

module.exports.model = Routes.controller.model;

module.exports.start = () => {
    var appConfig = config.app[config.app.env];

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(fileUpload());

    app.use('/', Routes.auto());

    var port = appConfig.port,
        hostname = appConfig.hostname;

    app.listen(port, hostname, function () {
        console.log(`Server running at http://${hostname}:${port}/`);
    });

};


