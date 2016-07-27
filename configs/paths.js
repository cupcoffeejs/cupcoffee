/**
 * configs/paths.js
 * */

var path = require('path');

module.exports = (root) => {
    if(!root){
        root = path.resolve('.');
    }

    paths = {};
    paths.root = root;

    paths.core = {};
    paths.core.core = path.join(__dirname, '..');
    paths.core.app = path.join(paths.core.core, 'app');
    paths.core.controllers = path.join(paths.core.core, 'controllers');
    paths.core.models = path.join(paths.core.core, 'models');
    paths.core.views = path.join(paths.core.core, 'views');
    paths.core.routes = path.join(paths.core.core, 'routes');

    paths.app = {};
    paths.app.app = path.join(root, 'app');
    paths.app.controllers = path.join(paths.app.app, 'controllers');
    paths.app.models = path.join(paths.app.app, 'models');
    paths.app.views = path.join(paths.app.app, 'views');
    paths.app.routes = path.join(paths.app.app, 'routes');
    paths.app.middleware = path.join(paths.app.app, 'middleware');
    paths.app.events = path.join(paths.app.app, 'events');

    paths.configs = path.join(__dirname, '..', '..', 'configs');

    paths.public = {};
    paths.public.public = path.join(root, 'public');
    paths.public.js = path.join(paths.public.public, 'js');
    paths.public.images = path.join(paths.public.public, 'images');
    paths.public.fonts = path.join(paths.public.public, 'fonts');
    paths.public.less = path.join(paths.public.public, 'less');
    paths.public.stylus = path.join(paths.public.public, 'styl');
    paths.public.sass = path.join(paths.public.public, 'sass');
    paths.public.css = path.join(paths.public.public, 'css');

    paths.assets = {};
    paths.assets.assets = path.join(root, 'assets');
    paths.assets.js = path.join(paths.assets.assets, 'js');
    paths.assets.images = path.join(paths.assets.assets, 'images');
    paths.assets.fonts = path.join(paths.assets.assets, 'fonts');
    paths.assets.less = path.join(paths.assets.assets, 'less');
    paths.assets.stylus = path.join(paths.assets.assets, 'styl');
    paths.assets.sass = path.join(paths.assets.assets, 'sass');
    paths.assets.css = path.join(paths.assets.assets, 'css');

    return paths;
} ;