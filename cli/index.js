var paths = require('../configs/paths'),
    config = require('../configs/config');
    
module.exports = () => {
    this.model = require('../models')()

    this.view = new(require('../views'))();
    this.controller = new(require('../controllers'))();
    this.controller.view = this.view;
    this.controller.model = this.model;
    this.logger = require('../logs')();

    return this;
}