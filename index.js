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
    this.root = path.resolve('.');

    this.init = (rootInit = false) => {
        if(rootInit){
            this.root = rootInit;
        }

        this.paths = require('./configs/paths')(this.root);

        this.config = require(path.join(this.paths.root, 'cupcoffee.json'));

        this.env = (process.env.NODE_CUPCOFFEE_ENV) ?
            process.env.NODE_CUPCOFFEE_ENV : (process.env.NODE_ENV) ?
            process.env.NODE_ENV : 'development';

        this.events = new events(this.config, this.paths)
        this.middleware = new middleware(this.config, this.paths)

        if (this.config.app) {
            if (!this.config.app[this.env]) {
                if (this.config.app.env) {
                    if (this.config.app[this.config.app.env]) {
                        this.env = this.config.app.env;
                    }
                } else if (this.config.app['development']) {
                    this.env = 'development';
                } else if (this.config.app['production']) {
                    this.env = 'production';
                } else {
                    console.error("CUPCOFFEE: NODE_CUPCOFFEE_ENV or NODE_ENV need to be declared.")
                    return false;
                }
            }
        }

        return true;
    }

    this.app = () => {
        if(this.init()){
            var Routes = module.exports.routes = new(require('./routes'))(this.config.app[this.env], this.paths);
        }
        else{
            return false;
        }

        if (this.events.exists('createApp')) {
            return this.exists.emit('createApp', {
                paths: this.paths,
                config: this.config,
                env: this.env,
                routes: Routes,
                controller: Routes.controller,
                model: Routes.model,
                view: Routes.view,
                logger: Routes.logger
            })
        } else {
            var app = express()

            app.use(bodyParser.urlencoded());
            app.use(bodyParser.json());
            app.use(fileUpload());

            if (this.middleware.exists('express')) {
                app.use(this.middleware.emit('express', {
                    paths: this.paths,
                    config: this.config,
                    env: this.env,
                    routes: Routes,
                    controller: Routes.controller,
                    model: Routes.model,
                    view: Routes.view,
                    logger: Routes.logger
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
/**
 * Testar multiple  antes de publicar
 */
    this.multiple = () => {
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
    }

    this.cli = (root, callback) => {
        if(typeof root == 'function'){
            callback = root;

            var configsLocals = [
                path.resolve('../'),
                path.resolve('../../'),
                path.resolve('../../../'),
                path.resolve('../../../../'),
                path.resolve('../../../../../')
            ]

            for(var key in configsLocals){
                if(exists(path.resolve(configsLocals[key], 'cupcoffee.json'))){
                    this.root = configsLocais[key];
                    break;
                }
            }
        }
        else{
            if(exists(path.resolve(root, 'cupcoffee.json'))){
                this.root = root;
            }
            else{
                console.error('Cannot find cupcoffee.json')
                return false;
            }
        }

        if(this.init(this.root)){
            var cli = require('./cli')(this.config.app[this.env], this.paths)
            return callback(cli);
        }

        return false;
    }

    this.start = () => {
        if(!this.init()){
            return false;
        }

        var port = this.config.app[this.env].port,
            hostname = this.config.app[this.env].hostname,
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
