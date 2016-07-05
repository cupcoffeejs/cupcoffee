"use strict";

var path = require('path'),
    bodyParser = require('body-parser'),
    fileUpload = require('express-fileupload'),
    evh = require('express-vhost'),
    express = require('express'),
    server = express();


module.exports = (root) => {
    var paths = require('./configs/paths')(root),
        config = require(path.join(paths.root, 'cupcoffee.json'));

    if (config.app) {
        var Routes = module.exports.routes = new (require('./routes'))(config.app[config.app.env], paths);
    }

    this.app = () => {
        var app = express()
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(bodyParser.json());
        app.use(fileUpload());
        app.use(Routes.auto());
        return app
    }

    this.multiple = () => {
        if (config.multiple) {
            server.use(evh.vhost(server.enabled('trust proxy')));
            server.listen(config.multiple.port);

            config.multiple.sites.forEach((site) => {
                var app = require(path.join(path.resolve(site.path), 'index.js'))(site, config);

                if (!Array.isArray(site.domain)) {
                    site.domain = [site.domain];
                }

                for (var key in site.domain) {
                    evh.register(site.domain[key], app);
                    console.log(`Site ${site.name}, domain ${site.domain[key]}, registed in port ${config.multiple.port}`)
                }
            })
        }
    }

    this.start = () => {
        this.app().listen(config.app[config.app.env].port, config.app[config.app.env].hostname, function () {
            console.log(`Server running at http://${config.app[config.app.env].hostname}:${config.app[config.app.env].port}/`);
        });
    };

    return this;
}