"use strict";

var path = require('path'),
    bodyParser = require('body-parser'),
    fileUpload = require('express-fileupload'),
    evh = require('express-vhost'),
    express = require('express'),
    exists = require('fs-exists-sync'),
    events = require('./events/index.js'),
    middleware = require('./middleware/index.js'),
    server = express(),
    paths = require('./configs/paths'),
    config = require('./configs/config');


module.exports = () => {
    this.root = config('root') || path.resolve('.');

    this.paths = paths;

    this.config = config;

    this.init = () => {
        this.env = config('env') || 'development'
        this.events = new events()
        this.middleware = new middleware()

        return true;
    }

    this.app = () => {
            if (this.init()) {
                var Routes = module.exports.routes = new(require('./routes'))();
            } else {
                return false;
            }

            if (this.events.exists('createApp')) {
                return this.exists.emit('createApp', {
                    routes: Routes,
                    controller: Routes.controller,
                    model: Routes.model,
                    view: Routes.view,
                    logger: Routes.logger
                })
            } else {
                var app = express()

                app.use(bodyParser.urlencoded({
                    extended: false
                }));
                app.use(bodyParser.json());
                app.use(fileUpload());

                if (this.middleware.exists('express')) {
                    app.use(this.middleware.emit('express', {
                        routes: Routes,
                        controller: Routes.controller,
                        model: Routes.model,
                        view: Routes.view,
                        logger: Routes.logger
                    }))
                }

                var publicPath = config('public') || paths.public.public;

                if (exists(publicPath)) {
                    app.use(express.static(publicPath));
                }

                app.use(Routes.auto());

                return app
            }
        }
        /**
         * Testar multiple  antes de publicar
         */
        /* this.multiple = () => {
             if (this.init() && this.config.multiple) {
                 var config = this.config.multiple;

                 if (config[this.env]) {
                     config = config[this.env];
                 }

                 server.use(evh.vhost(server.enabled('trust proxy')));
                 server.listen(config.port);

                 config.sites.forEach((site) => {
                     if (site[this.env]) {
                         site = site[this.env];
                     }

                     try {
                         var app = require(path.resolve(site.path))(site, config);
                     } catch (err) {
                         var app = express()
                         app.use(bodyParser.urlencoded({
                             extended: false
                         }));
                         app.use(bodyParser.json());
                         app.use(fileUpload());
                         app.use(express.static(site.path));
                     }

                     if (!Array.isArray(site.domain)) {
                         site.domain = [site.domain];
                     }

                     for (var key in site.domain) {
                         evh.register(site.domain[key], app);
                         console.log(`Site ${site.name}, domain ${site.domain[key]}, registed in port ${config.port}`)
                     }

                 })
             }
         }*/

    this.cli = (callback) => {
        var cli = require('./cli')()
        return callback(cli);
        return false;
    }

    this.start = () => {
        if (!this.init()) {
            return false;
        }

        var port = config('port'),
            hostname = config('host') || config('hostname') || config('ip') || 'localhost',
            events = this.events


        this.app().listen(port, hostname, function() {
            events.emit('startServer', {
                port,
                hostname
            })
            console.log(`Server running at http://${hostname}:${port}/`);
        });
    };

    return this;
}
