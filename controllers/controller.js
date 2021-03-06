
"use strict";

var fs = require("fs"),
    path = require("path"),
    count = require("object-count"),
    merge = require("utils-merge"),
    exists = require('fs-exists-sync'),
    events = require('../events/index.js'),
    paths = require('../configs/paths'),
    config = require('../configs/config');

module.exports = class {

    constructor() {
        this.files = {};
        this.events = new events();
        this.view = new(require('../views'))();
    }

    find() {
        var url = this.request.params[0].split('/');

        var position = 0;

        if(!url[0]){
            ++position;
        }

        if (url[position]) {
            var controller = url[position],
                action = (url[++position]) ? url[position] : 'index',
                params = [];

            if (url[++position]) {
                for (var i = position; i < url.length; i++) {
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
        if (action) {
            if (this.files[controller]) {
                var control = require(path.join(paths.app.controllers, controller + 'Controller.js'))({});
                if (typeof control[action] == 'function') {
                    return true
                }
                else if (this.request) {
                    return (typeof control[this.request.method.toLocaleLowerCase() + '_' + action] == 'function');
                }
                else {
                    return false
                }
            }

            return false;
        }

        return (this.files[controller]);
    }

    invoke(controller, action, params, scaffold) {
        if (!params) {
            if (this.request.params[0]) {
                params = this.request.params[0].split('/')
            }
        }

        var app = {
            controller, action, params,
            model: null,
            view: null,
            request: null,
            response: null,
            req: null,
            res: null,
            events: this.events,
            logger: this.logger
        };

        if (this.view) {
            app.view = this.view.controller(controller, action);
        }

        if (this.model) {
            app.model = this.model;
        }

        if (this.request) {
            app.request = this.request;
            app.req = this.request;

            app.method = this.request.method.toLocaleLowerCase();
            var methodAction = app.methodAction = app.method + '_' + action;
        }

        if (this.response) {
            app.response = this.response;
            app.res = this.response;
        }

        if (!this.files[controller]) {
            return this.error(controller, action, 404);
        }

        app = this.events.emit('afterLoadController', app)

        if(!app){
            return;
        }

        var defaultController;

        if(exists(path.join(paths.app.controllers, 'index.js'))){
            defaultController = require(path.join(paths.app.controllers, 'index.js'))(app);
            app.index = defaultController;
        }
        else{
            app.index = null;
        }


        var control = require(path.join(paths.app.controllers, controller + 'Controller.js'))(app);

        if(control.init){
            if(control.init() === false){
                return
            }
        }

        if (typeof control[methodAction] == 'function') {
            action = methodAction;
        }

        if ((scaffold && control.scaffold === false) || (typeof control[action] != 'function')) {
            return this.error(controller, action, 404);
        }

        if (count(this.request.body) && params.length == 0) {
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
        this.view.http(request, response)
        return this;
    }

    load() {
        var files = [];
        if (exists(paths.app.controllers)) {
            fs.readdirSync(paths.app.controllers)
                .filter(function (file) {
                    return (file.indexOf(".") !== 0) && (file !== "index.js") && (file.indexOf("Controller") > -1);
                })
                .forEach(function (file) {
                    files[file.replace('Controller.js', '')] = file;
                });

            this.files = files;
        }

        return files;
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
