var fs = require('fs'),
    exists = require('fs-exists-sync'),
    path = require('path')


module.exports = class {

    constructor(config, paths) {
        paths = paths;
        this.events = [];

        var files = this.loadFiles();

        for(var key in files){
            this.events.push(require(files[key])({config, paths}));
        }

        return this;
    }

    loadFiles() {
        var files = [];

        if (exists(paths.app.events)) {
            fs.readdirSync(paths.app.events)
                .filter(function (file) {
                    return (file.indexOf(".") !== 0);
                })
                .forEach(function (file) {
                    files.push(path.join(paths.app.events, file));
                });
        }

        return files;
    }

    exists(name){
        for(var key in this.events){
            if(this.events[key][name]){
                return true
            }
        }

        return false;
    }

    emit(eventName, options){
        var events = (name, options, key = 0) => {
            for(var i = key; i < this.events.length; i++){
                if(this.events[i][name]){
                    return this.events[i][name](options, (returns) => {
                        return events(name, returns, ++i)
                    })
                }
            }

            return options;
        }

        return events(eventName, options);
    }

}