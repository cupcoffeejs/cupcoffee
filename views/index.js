/**
 * views/index.js
 * */

"use strict";

var pug = require('pug'),
    path = require('path'),
    fs = require('fs'),
    paths = require('../configs/paths'),
    config = require('../configs/config')

module.exports = class {

    constructor() {
        this.templateActive = true;
        this.templateOptions = null;
        this.renderContent = null;

        if (config('template')) {
            this.templateName = this.templateNameDefault = config('template');

            if (!path.extname(this.config.template.layout)) {
                this.config.template.layout += '.pug';
            }

            this.templateLayout = this.templateLayoutDefault = config('template_layout');
        }
        else {
            this.templateName = this.templateNameDefault = 'default';
            this.templateLayout = this.templateLayoutDefault = 'default.pug';
        }

        this.errors = {
            "100": "Continue",
            "101": "Switching Protocols",
            "102": "Processing",
            "200": "OK",
            "201": "Created",
            "202": "Accepted",
            "203": "Non-Authoritative Information",
            "204": "No Content",
            "205": "Reset Content",
            "206": "Partial Content",
            "207": "Multi-Status",
            "208": "Already Reported",
            "226": "IM Used",
            "300": "Multiple Choices",
            "301": "Moved Permanently",
            "302": "Found",
            "303": "See Other",
            "304": "Not Modified",
            "305": "Use Proxy",
            "306": "Switch Proxy",
            "307": "Temporary Redirect",
            "308": "Permanent Redirect",
            "400": "Bad Request",
            "401": "Unauthorized",
            "402": "Payment Required",
            "403": "Forbidden",
            "404": "Not Found",
            "405": "Method Not Allowed",
            "406": "Not Acceptable",
            "407": "Proxy Authentication Required",
            "408": "Request Timeout",
            "409": "Conflict",
            "410": "Gone",
            "411": "Length Required",
            "412": "Precondition Failed",
            "413": "Payload Too Large",
            "414": "URI Too Long",
            "415": "Unsupported Media Type",
            "416": "Range Not Satisfiable",
            "417": "Expectation Failed",
            "418": "I'm a teapot",
            "421": "Misdirected Request",
            "422": "Unprocessable Entity",
            "423": "Locked",
            "424": "Failed Dependency",
            "426": "Upgrade Required",
            "428": "Precondition Required",
            "429": "Too Many Requests",
            "431": "Request Header Fields Too Large",
            "451": "Unavailable For Legal Reasons/Redirect",
            "103": "Checkpoint",
            "420": "Method Failure/Enhance Your Calm",
            "450": "Blocked by Windows Parental Controls",
            "498": "Invalid Token",
            "499": "Token Required/Request has been forbidden by antivirus",
            "509": "Bandwidth Limit Exceeded",
            "530": "Site is frozen",
            "440": "Login Timeout",
            "449": "Retry With"
        }

    }

    templatePath(template, layout) {
        return path.join(paths.app.views, 'templates', this.templateName, this.templateLayout);
    }

    controller(controllerName, action) {
        if (controllerName) {
            this.controllerName = controllerName;
        }

        if (action) {
            this.actionName = action;
        }

        return this;
    }

    http(request, response) {
        this.response = response;

        this.request = request;

        return this;
    }

    setConfig({response, request}) {
        if (response) {
            this.response = response;
        }

        if (response) {
            this.request = request;
        }

        if (paths) {
            paths = paths;
        }

        if (config) {
            this.config = config;
        }

        return this;
    }

    error(error, message, options = {}) {
        if (typeof error == 'object' && error['error']) {
            options = error;
            error = error.error;
            message = null;
        }

        if (typeof message == 'object') {
            options = message;
            message = null;
        }

        this.response.status(error);

        if (!options.error) {
            options.error = error;
        }

        if (!options.message && !message) {
            if (this.errors[error]) {
                options.message = this.errors[error]
            }
            else {
                options.message = ""
            }
        }

        if (this.request.accepts('html')) {
            return this.template(null, 'errors').render('errors/errors', options).send();
        }

        if (this.request.accepts('json')) {
            return this.response.send(options);
        }

        return this.response.type('txt').send(options.error + ' - ' + options.message);
    }

    template(name, layout = 'default.pug', options = null) {
        if (name === false) {
            this.templateActive = false;
            return this;
        }
        else if (name === null) {
            name = this.templateName;
        }

        if (typeof name == 'object') {
            this.templateOptions = name;
        }
        else if (typeof layout == 'object' && typeof name == 'string') {
            this.templateOptions = layout;
            this.templateName = name;
        }
        else {
            if (!path.extname(layout)) {
                layout += '.pug';
            }

            this.templateLayout = layout;
            this.templateName = name;
            this.templateOptions = options;
        }

        this.templateActive = true;

        return this;
    }

    render(name, options) {
        var viewPaths;

        if (typeof name == 'object') {
            options = name;
            name = this.actionName;
        }

        if (!name) {
            name = this.actionName;
        }

        if(!this.controllerName){
            return console.error('ERROR: Controller name not defined')
        }

        if (!path.extname(name)) {
            viewPaths = [
                path.join(paths.app.views, this.controllerName, name + '.pug'),
                path.join(paths.app.views, this.controllerName, name + '.jade'),
                path.join(paths.app.views, this.controllerName, name + '.html'),
                path.join(paths.app.views, name + '.pug'),
                path.join(paths.app.views, name + '.jade'),
                path.join(paths.app.views, name + '.html')
            ]

        }
        else {
            viewPaths = [
                path.join(paths.app.views, this.controllerName, this.actionName, name),
                path.join(paths.app.views, this.controllerName, name),
                path.join(paths.app.views, name)
            ]
        }

        for (var key in viewPaths) {
            try {
                if (path.extname(viewPaths[key]) == '.pug') {
                    return this.renderTemplate(pug.renderFile(viewPaths[key], options))
                }

                var html = fs.readFileSync(viewPaths[key]).toString();

                if (options) {
                    html = pug.render('script var view = ' + JSON.stringify(options)) + "\n\n" + html;
                }

                return this.renderTemplate(html);
            }
            catch (e) {
                //..
            }
        }

        console.error(`Error: View /${this.controllerName}/${name} and /${name} not found`);
        return this.error(404, options);
    }

    renderTemplate(content) {
        if (!this.templateActive) {
            this.renderContent = content;
        }
        else if (path.extname(this.templateLayout) == '.pug' || path.extname(this.templateLayout) == '.jade') {
            if (this.templateOptions) {
                this.templateOptions.content = content;
                content = this.templateOptions;
                this.templateOptions = null;
            }
            else {
                content = {content}
            }

            this.renderContent = pug.renderFile(this.templatePath(), content)
        }
        else {
            var html = fs.readFileSync(this.templatePath()).toString();

            this.renderContent = pug.render('script var view = ' + JSON.stringify(content)) + "\n\n" + html;
        }

        this.templateName = this.templateNameDefault;
        this.templateLayout = this.templateLayoutDefault;

        return this;
    }

    send(content) {
        if (content == undefined && this.renderContent) {
            content = this.renderContent;
            this.renderContent = null;
        }

        this.response.send(content);
    }
}
