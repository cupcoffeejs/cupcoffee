/**
 * controllers/index.js
 * */

"use strict";

module.exports = (config, paths) => {
    this.model = require('../models')(config, paths)

    this.view = new(require('../views'))({
        config,
        paths
    });

    this.controller = new(require('../controllers'))(config, paths);
    this.controller.view = this.view;
    this.controller.model = this.model;
    this.config = config;
    this.paths = paths;
    this.logger = require('../logs')(config, paths);

    return this;
}