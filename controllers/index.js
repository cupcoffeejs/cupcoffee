/**
 * controllers/index.js
 * */

"use strict";

var fs = require("fs"),
    path = require("path"),
    count = require("object-count"),
    merge = require("utils-merge"),
    paths = require("../configs/paths.js");


module.exports = class {

    constructor(config, paths) {
        this.files = {};
        this.config = config;
        this.paths = paths;
        this.appControllerPath = path.join(__dirname, '..', '..', '..', 'app', 'controllers');
        this.view = new (require('../views'))({config, paths});
        this.model = (config.database) ? new (require('../models'))(config.database) : null;
    }

    find() {
        this.view.request = this.request;
        this.view.response = this.response;
        var url = this.request.params[0].split('/');

        if (url[1]) {
            var controller = url[1],
                action = (url[2]) ? url[2] : 'index',
                params = [];

            if (url[3]) {
                for (var i = 3; i < url.length; i++) {
                    params.push(url[i]);
                }
            }

            if (this.exists(controller, action)) {
                return this.invoke(controller, action, params, true)
            }

            return this.error(controller, action, 404);

        }
        else {
            return this.invoke('index', 'index', [], true)
        }
    }

    exists(controller, action = false) {
console.log([controller, action])
        if (action) {
            if (this.files[controller]) {
                var control = require(path.join(this.appControllerPath, controller + 'Controller.js'))({});
                return (typeof control[action] == 'function')
            }

            return false;
        }

        return (this.files[controller]);
    }

    invoke(controller, action, params, scaffold) {
        var views = this.view.controller(controller, action);

        if (!params) {
            if (this.request.params[0]) {
                params = this.request.params[0].split('/')
            }
        }

        var app = {
            controller, action, params,
            app: {
                controller, action, params
            },
            view: views,
            model: this.model,
            request: null,
            response: null
        };

        if (this.request) {
            app.request = this.request;

            app.method = this.request.method.toLocaleLowerCase();
            var methodAction = app.methodAction = app.method + '_' + action;
        }

        if (this.response) {
            app.response = this.response;
        }

        if (!this.files[controller]) {
            return this.error(controller, action, 404);
        }

        var control = require(path.join(this.appControllerPath, controller + 'Controller.js'))(app);

        if (typeof control[methodAction] == 'function') {
            action = methodAction;
        }

        if ((scaffold && control.scaffold === false) || (typeof control[action] != 'function')) {
            return this.error(controller, action, 404);
        }

        if (count(this.request.body)) {
            var body = this.request.body;

            if (!body.files && this.request.files) {
                body.files = this.request.files;
            }

            return this.out(control[action].apply(null, [body]))
        }
        else {
            if (count(this.request.query)) {
                params.push(this.request.query)
            }

            return this.out(control[action].apply(null, params))
        }

    }

    out(data) {
        if (data) {
            if (typeof data == 'object' && data.renderContent) {
                return this.response.send(data.renderContent);
            }

            return this.response.send(data);
        }

        return '';
    }

    http(request, response) {
        this.request = request;
        this.response = response;
        this.view.setConfig({request, response});
        return this;
    }

    load() {
        var files = [];

        fs.readdirSync(this.appControllerPath)
            .filter(function (file) {
                return (file.indexOf(".") !== 0) && (file !== "index.js") && (file.indexOf("Controller") > -1);
            })
            .forEach(function (file) {
                files[file.replace('Controller.js', '')] = file;
            });

        this.files = files;

        return this;
    }

    error(controller, action, error) {
        var message = this.view.errors[error] ? this.view.errors[error] : '';

        if (this.exists(controller, 'error' + error)) {
            return this.invoke(controller, 'error' + error, [message], true)
        }
        else if (this.exists(controller, 'errors')) {
            return this.invoke(controller, 'errors', [error, message], true)
        }
        else if (this.exists('error' + error, 'index')) {
            return this.invoke('error' + error, 'index', [message], true)
        }
        else if (this.exists('errors', 'error' + error)) {
            return this.invoke('errors', 'error' + error, [error, message], true)
        }
        else if (this.exists('errors', 'index')) {
            return this.invoke('errors', 'index', [error, message], true)
        }
        else {
            return this.view.error(error, message)
        }
    }

}
