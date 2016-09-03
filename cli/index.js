var paths = require('../configs/paths'),
    config = require('../configs/config');

module.exports = () => {
    this.model = require('../models')()
    this.logger = require('../logs')();
    this.view = new(require('../views'))();
    this.controller = new(require('../controllers'))()

    return this;
}
