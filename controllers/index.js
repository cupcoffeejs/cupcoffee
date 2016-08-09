/**
 * controllers/index.js
 * */

"use strict";

var controller = require('./controller.js')

module.exports = class {

    constructor(config, paths) {
        this.config = config;
        this.paths = paths;
        this.controller = new controller(config, paths)
    }

    load() {
        this.files = this.controller.load()
        return this.files;
    }

    init(){
        var control = new controller(this.config, this.paths)
        if(this.files){
            control.files = this.files;
        }

        return control;
    }

}
