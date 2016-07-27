"use strict";

var path = require('path'),
    bodyParser = require('body-parser'),
    fileUpload = require('express-fileupload'),
    evh = require('express-vhost'),
    express = require('express'),
    exists = require('fs-exists-sync'),
    events = require('./events/index.js'),
    middleware = require('./middleware/index.js'),
    server = express();

module.exports = (root) => {
    this.paths = require('./configs/paths')(root);
    this.config = require(path.join(this.paths.root, 'cupcoffee.json'));

    this.env = (process.env.NODE_CUPCOFFEE_ENV) ?
        process.env.NODE_CUPCOFFEE_ENV : (process.env.NODE_ENV) ?
        process.env.NODE_ENV : 'development';

    this.events = new events(this.paths)
    this.middleware = new middleware(this.paths)

    this.app = () => {
        if (this.config.app) {
            if (!this.config.app[this.env]) {
                if (this.config.app.env) {
                    if (this.config.app[config.app.env]) {
                        this.env = this.config.app.env;
                    }
                } else if (this.config.app['development']) {
                    this.env = 'development';
                }
                else if (this.config.app['production']) {
                    this.env = 'production';
                }
                else {
                    console.error("CUPCOFFEE: NODE_CUPCOFFEE_ENV or NODE_ENV need to be declared.")
                    return 0;
                }
            }

            var Routes = module.exports.routes = new (require('./routes'))(this.config.app[this.env], this.paths);
        }

        if (this.events.exists('createApp')) {
            return this.exists.emit('createApp', {
                paths: this.paths, config: this.config, env: this.env, routes: Routes
            })
        }
        else {
            var app = express()

            app.use(bodyParser.urlencoded({extended: false}));
            app.use(bodyParser.json());
            app.use(fileUpload());

            if (this.middleware.exists('express')) {
                app.use(this.middleware.emit('express', {
                    paths: this.paths, config: this.config, env: this.env, routes: Routes
                }))
            }

            var publicPath = this.config.app.publicPath || this.paths.public.public;

            if (exists(publicPath)) {
                app.use(express.static(publicPath));
            }

            app.use(Routes.auto());

            return app
        }
    }

    this.multiple = () => {
        if (this.config.multiple) {
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
                }
                catch (err) {
                    var app = express()
                    app.use(bodyParser.urlencoded({extended: false}));
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
    }

    this.start = () => {
        var port = this.config.app[this.env].port,
            hostname = this.config.app[this.env].hostname;
            events = this.events

        this.app().listen(port, hostname, function () {
            events.emit('startServer', {port, hostname})
            console.log(`Server running at http://${hostname}:${port}/`);
        });
    };

    return this;
}