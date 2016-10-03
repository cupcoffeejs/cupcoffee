var fs = require('fs'),
    exists = require('fs-exists-sync'),
    path = require('path'),
    paths = require('../configs/paths'),
    config = require('../configs/config')

module.exports = class {

    constructor() {
        this.middleware = {};

        var files = this.loadFiles();

        for (var key in files) {

            this.middleware[path.basename(files[key], '.js')] = require(files[key]);
        }

        return this;
    }

    loadFiles() {
        var files = [];

        if (exists(paths.app.middleware)) {
            fs.readdirSync(paths.app.middleware)
                .filter(function(file) {
                    return (file.indexOf(".") !== 0 && path.extname(file) == ".js");
                })
                .forEach(function(file) {
                    files.push(path.join(paths.app.middleware, file));
                });
        }

        return files;
    }

    exists(name) {
        return (this.middleware[name]);
    }

    emit(name, options) {
        if (this.middleware[name]) {
            return this.middleware[name](options);
        }
    }

}
