/**
 * controllers/index.js
 * */

"use strict";

var controller = require('./controller.js'),
    paths = require('../configs/paths'),
    config = require('../configs/config');


module.exports = class {

    constructor() {
        this.controller = new controller()
    }

    load() {
        this.files = this.controller.load()
        return this.files;
    }

    init(req, res) {
        var control = new controller()
        if(req && res){
            control.http(req, res);
        }
        
        if (this.files) {
            control.files = this.files;
        }

        return control;
    }

}